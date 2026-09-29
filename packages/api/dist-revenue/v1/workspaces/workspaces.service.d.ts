export declare class WorkspacesService {
    /**
     * Create a new workspace for a user
     */
    createWorkspace(userId: string, data: {
        name: string;
        urlSlug: string;
        subscriptionId: string;
    }): Promise<{
        id: any;
        ownerId: string;
        name: string;
        urlSlug: string;
        subscriptionId: string;
        createdAt: Date;
        inviteLink: string;
    }>;
    /**
     * Get workspace details
     */
    getWorkspace(workspaceId: string): Promise<{
        id: string;
        name: string;
        urlSlug: string;
        ownerId: string;
        memberCount: number;
        createdAt: Date;
    }>;
    /**
     * Invite team members to workspace
     */
    inviteMembers(workspaceId: string, emails: string[]): Promise<{
        invited: number;
        invitations: {
            workspaceId: string;
            email: string;
            token: any;
            expiresAt: Date;
        }[];
    }>;
    /**
     * Get workspace members
     */
    getMembers(workspaceId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        joinedAt: Date;
    }[]>;
    /**
     * Update workspace settings
     */
    updateWorkspace(workspaceId: string, data: Partial<{
        name: string;
        timezone: string;
    }>): Promise<{
        success: boolean;
        updated: Partial<{
            name: string;
            timezone: string;
        }>;
    }>;
    /**
     * Delete workspace (cancel subscription)
     */
    deleteWorkspace(workspaceId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=workspaces.service.d.ts.map