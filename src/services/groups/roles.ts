import { callReadOperationParsed, callWriteOperationParsed } from '../api/client.js';
import {
  toGroupRoleSummary,
  type GroupRoleSummary,
  type GroupRolesManageInput,
} from '../../models/groups.js';

export async function listGroupRoles(groupId: string): Promise<{ roles: GroupRoleSummary[] }> {
  const result = await callReadOperationParsed('getGroupRoles', { groupId });
  return {
    roles: result.data
      .map(toGroupRoleSummary)
      .filter((role): role is GroupRoleSummary => Boolean(role)),
  };
}

export async function getGroupRoleTemplates(): Promise<{ templates: Record<string, unknown> }> {
  const result = await callReadOperationParsed('getGroupRoleTemplates');
  return { templates: result.data as Record<string, unknown> };
}

function roleBodyFromInput(input: GroupRolesManageInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if ('roleId' in input && input.roleId) body.id = input.roleId;
  if ('name' in input && input.name !== undefined) body.name = input.name;
  if ('description' in input && input.description !== undefined) body.description = input.description;
  if ('permissions' in input && input.permissions !== undefined) body.permissions = input.permissions;
  if ('isSelfAssignable' in input && input.isSelfAssignable !== undefined) {
    body.isSelfAssignable = input.isSelfAssignable;
  }
  if ('order' in input && input.order !== undefined) body.order = input.order;
  return body;
}

export async function manageGroupRole(
  groupId: string,
  input: GroupRolesManageInput
): Promise<{
  roleIds?: string[];
  role?: GroupRoleSummary | null;
  roles?: GroupRoleSummary[];
}> {
  if (input.action === 'assign_member_role') {
    const result = await callWriteOperationParsed('addGroupMemberRole', {
      groupId,
      userId: input.userId,
      groupRoleId: input.groupRoleId,
    });
    return { roleIds: result.data };
  }
  if (input.action === 'remove_member_role') {
    const result = await callWriteOperationParsed('removeGroupMemberRole', {
      groupId,
      userId: input.userId,
      groupRoleId: input.groupRoleId,
    });
    return { roleIds: result.data };
  }
  if (input.action === 'create_role') {
    const result = await callWriteOperationParsed('createGroupRole', { groupId }, roleBodyFromInput(input));
    return { role: result.data ? toGroupRoleSummary(result.data) : null };
  }
  if (input.action === 'update_role') {
    const result = await callWriteOperationParsed(
      'updateGroupRole',
      { groupId, groupRoleId: input.groupRoleId },
      roleBodyFromInput(input)
    );
    return {
      roles: result.data
        .map(toGroupRoleSummary)
        .filter((role): role is GroupRoleSummary => Boolean(role)),
    };
  }

  if (input.action === 'delete_role') {
    const result = await callWriteOperationParsed('deleteGroupRole', {
      groupId,
      groupRoleId: input.groupRoleId,
    });
    return {
      roles: result.data
        .map(toGroupRoleSummary)
        .filter((role): role is GroupRoleSummary => Boolean(role)),
    };
  }

  const exhaustive: never = input;
  throw new Error(`Unsupported group role action: ${JSON.stringify(exhaustive)}`);
}
