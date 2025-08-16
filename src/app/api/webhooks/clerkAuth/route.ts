import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { Role } from '@prisma/client';

function mapClerkRole(input?: string): Role {
  const s = (input || '').toLowerCase();
  if (['owner', 'org:owner'].includes(s)) return Role.OWNER;
  if (['admin', 'org:admin'].includes(s)) return Role.ADMIN;
  // Clerk often uses "member" or "basic_member"
  if (['member', 'basic_member', 'org:member', ''].includes(s))
    return Role.MEMBER;
  // Fallback to MEMBER if unrecognized
  return Role.MEMBER;
}

export async function POST(req: Request) {
  const Webhook_SECRET = process.env.SIGNING_SECRET;

  if (!Webhook_SECRET) {
    return new Response(
      'Missing Webhook_SECRET. Please set it in your environment variables.',
      { status: 400 }
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get('svix-id');
  const svix_timestamp = (await headerPayload).get('svix-timestamp');
  const svix_signature = (await headerPayload).get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing required headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix Instance with your webhook_secret
  const wh = new Webhook(Webhook_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    return new Response(`Webhook verification failed: ${error}`, {
      status: 400,
    });
  }

  const eventType = evt.type;
  // User Creation
  if (eventType === 'user.created') {
    try {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        primary_email_address_id,
      } = evt.data;

      if (!id || !email_addresses) {
        return new Response('Missing required user data in event', {
          status: 400,
        });
      }
      const email_address = email_addresses.find(
        (email) => email.id === primary_email_address_id
      )?.email_address;

      await db.user.create({
        data: {
          clerk_user_id: id,
          email: email_address || '',
          first_name: first_name || '',
          last_name: last_name || '',
        },
      });
      return new Response('User created', { status: 201 });
    } catch (err) {
      return new Response(`Failed to create user: ${err}`, { status: 500 });
    }
  } // User Updation
  else if (eventType === 'user.updated') {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      primary_email_address_id,
    } = evt.data;
    if (!id || !email_addresses) {
      return new Response('Missing required user data in event', {
        status: 400,
      });
    }

    const email_address = email_addresses.find(
      (email) => email.id === primary_email_address_id
    )?.email_address;

    try {
      await db.user.update({
        where: {
          clerk_user_id: id,
        },
        data: {
          email: email_address,
          first_name: first_name || '',
          last_name: last_name || '',
        },
      });
      return new Response('User updated', { status: 200 });
    } catch (err) {
      return new Response(`Failed to update user: ${err}`, { status: 500 });
    }
  } // User Deletion
  else if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (!id) {
      return new Response('Missing user ID in event', { status: 400 });
    }

    try {
      await db.$transaction(async (tx) => {
        // 1. Delete org memberships
        await tx.organizationMembership.deleteMany({
          where: { user_id: id },
        });

        // 2. Delete lead notes written by this user
        await tx.leadNote.deleteMany({
          where: { createdById: id },
        });

        // 3. Handle organizations they created
        //    First delete all leads & memberships in those orgs
        const orgs = await tx.organization.findMany({
          where: { created_by_id: id },
          select: { clerk_organization_id: true },
        });

        for (const org of orgs) {
          await tx.organizationMembership.deleteMany({
            where: { organization_id: org.clerk_organization_id },
          });
          await tx.leads.deleteMany({
            where: { organizationId: org.clerk_organization_id },
          });
          await tx.organization.delete({
            where: { clerk_organization_id: org.clerk_organization_id },
          });
        }

        // 4. Delete the user
        await tx.user.delete({
          where: { clerk_user_id: id },
        });
      });

      return new Response('User deleted', { status: 200 });
    } catch (error) {
      console.error('Failed to delete user:', error);
      return new Response(`Failed to delete user: ${error}`, { status: 500 });
    }
  } // Organization Creation
  else if (eventType === 'organization.created') {
    try {
      const { id, name, created_by, slug } = evt.data;

      if (!id || !name || !created_by) {
        return new Response('Missing required organization data in event', {
          status: 400,
        });
      }

      // 1. Ensure the creator exists
      const user = await db.user.findUnique({
        where: { clerk_user_id: created_by },
      });
      if (!user) {
        return new Response('User not found in DB', { status: 404 });
      }

      await db.$transaction(async (tx) => {
        // 2. Create the organization
        await tx.organization.create({
          data: {
            clerk_organization_id: id,
            name,
            slug,
            created_by_id: created_by,
          },
        });

        // 3. Add the creator as an ADMIN
        await tx.organizationMembership.create({
          data: {
            user_id: created_by,
            organization_id: id,
            role: 'ADMIN',
          },
        });
      });
      return new Response('Organization created', { status: 201 });
    } catch (err) {
      return new Response(`Failed to create organization: ${err}`, {
        status: 500,
      });
    }
  } // Organization Updated
  else if (eventType === 'organization.updated') {
    const { id, name } = evt.data;
    if (!id || !name) {
      return new Response('Missing required organization data in event', {
        status: 400,
      });
    }

    try {
      await db.organization.update({
        where: {
          clerk_organization_id: id,
        },
        data: {
          name: name,
        },
      });
      return new Response('Organization updated', { status: 200 });
    } catch (err) {
      return new Response(`Failed to update organization: ${err}`, {
        status: 500,
      });
    }
  } // Organization Deleted
  else if (eventType === 'organization.deleted') {
    const { id } = evt.data;
    if (!id) {
      return new Response('Missing organization ID in event', { status: 400 });
    }
    try {
      await db.$transaction(async (tx) => {
        // 1. Delete all memberships for that organization
        await tx.organizationMembership.deleteMany({
          where: { organization_id: id },
        });

        // 2. Delete all leads for that organization
        await tx.leads.deleteMany({
          where: { organizationId: id },
        });

        // 3. Delete the organization
        await tx.organization.delete({
          where: { clerk_organization_id: id },
        });
      });

      return new Response('Organization deleted', { status: 200 });
    } catch (err) {
      return new Response(`Failed to delete organization: ${err}`, {
        status: 500,
      });
    }
  } // Organization Invitation Accepted
  else if (eventType === 'organizationInvitation.accepted') {
    const { email_address, organization_id, role_name } = evt.data;

    if (!email_address || !organization_id) {
      return new Response('Missing required invitation data in event', {
        status: 400,
      });
    }

    try {
      await db.$transaction(async (tx) => {
        // 1. Find the organization
        const org = await tx.organization.findUnique({
          where: { clerk_organization_id: organization_id },
        });
        if (!org) {
          throw new Error('Organization not found');
        }

        // 2. Find the user by email
        const user = await tx.user.findUnique({
          where: { email: email_address },
        });
        if (!user) {
          throw new Error('User not found');
        }

        const role = mapClerkRole(role_name);
        // 3. Create membership (role could come from event data or default to MEMBER)
        await tx.organizationMembership.upsert({
          where: {
            user_id_organization_id: {
              user_id: user.clerk_user_id, // FK -> User.clerk_user_id
              organization_id: org.clerk_organization_id, // FK -> Org.clerk_organization_id
            },
          },
          update: { role },
          create: {
            user_id: user.clerk_user_id,
            organization_id: org.clerk_organization_id,
            role,
          },
        });
      });

      return new Response('Organization invitation accepted', { status: 200 });
    } catch (err) {
      return new Response(`Failed to accept organization invitation: ${err}`, {
        status: 500,
      });
    }
  } // Organization Membership Deleted
  else if (eventType === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data;

    const organization_id = organization.id;
    const user_id = public_user_data.user_id;

    if (!user_id || !organization_id) {
      return new Response('Missing required membership data in event', {
        status: 400,
      });
    }

    try {
      await db.$transaction(async (tx) => {
        // 1. Find the organization
        const org = await tx.organization.findUnique({
          where: { clerk_organization_id: organization_id },
        });
        if (!org) {
          throw new Error('Organization not found');
        }

        // 2. Find the user by id
        const user = await tx.user.findUnique({
          where: { clerk_user_id: user_id },
        });
        if (!user) {
          throw new Error('User not found');
        }

        // 3. Delete the membership record
        await tx.organizationMembership.delete({
          where: {
            user_id_organization_id: {
              user_id: user.clerk_user_id,
              organization_id: org.clerk_organization_id,
            },
          },
        });
      });

      return new Response('Organization membership deleted', { status: 200 });
    } catch (err) {
      return new Response(`Failed to delete organization membership: ${err}`, { status: 500 });
    }
  } else {
    return new Response(`Unhandled event type: ${eventType}`, { status: 404 });
  }
}
