import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { LucideAngularModule } from 'lucide-angular';
import { Project } from '../../../models/Project';
import { ProjectMember, ProjectRole } from '../../../models/ProjectMember';
import { ProjectInvitation } from '../../../models/ProjectInvitation';
import { AuthService } from '../../../services/auth/auth.service';
import { ProjectService } from '../../../services/project/project.service';
import { ProjectMemberService } from '../../../services/project-member/project-member.service';
import { InvitationService } from '../../../services/invitation/invitation.service';
import { ToastService } from '../../../services/toast/toast.service';

const ROLE_OPTIONS: { label: string; value: ProjectRole }[] = [
    { label: 'Viewer', value: 'viewer' },
    { label: 'Editor', value: 'editor' },
    { label: 'Admin', value: 'admin' },
];

@Component({
    selector: 'app-members',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        LucideAngularModule,
        ButtonModule,
        SelectModule,
        TagModule,
    ],
    templateUrl: './members.component.html',
    styleUrl: './members.component.scss',
    host: {
        class: 'flex-1 flex flex-col',
    },
})
export class MembersComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly projectService = inject(ProjectService);
    private readonly memberService = inject(ProjectMemberService);
    private readonly invitationService = inject(InvitationService);
    private readonly toastService = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    projectId = input.required<string>();

    project = signal<Project | null>(null);
    members = signal<ProjectMember[]>([]);
    pendingInvites = signal<ProjectInvitation[]>([]);
    userRole = signal<ProjectRole | 'owner' | null>(null);

    canManage = computed(() => ['owner', 'admin'].includes(this.userRole() ?? ''));

    roleOptions = ROLE_OPTIONS;

    private roleInitialized = false;

    ngOnInit() {
        this.projectService
            .getOne(this.projectId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((project) => {
                this.project.set(project);
                if (!this.roleInitialized) {
                    this.roleInitialized = true;
                    this.resolveUserRole(project);
                }
            });

        this.memberService
            .getByProject(this.projectId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((members) => this.members.set(members));

        this.invitationService
            .getByProject(this.projectId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((invites) => this.pendingInvites.set(invites));
    }

    private resolveUserRole(project: Project): void {
        const user = this.authService.getUser();
        if (!user) return;

        if (project.createdBy === user.uid) {
            this.userRole.set('owner');
            return;
        }

        this.memberService
            .getMembership(project.id, user.uid)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((member) => this.userRole.set(member?.role ?? null));
    }

    roleSeverity(role: ProjectRole): 'info' | 'warn' | 'success' {
        return role === 'admin' ? 'success' : role === 'editor' ? 'warn' : 'info';
    }

    async changeRole(member: ProjectMember, role: ProjectRole) {
        try {
            await this.memberService.updateRole(member.id, role);
            this.toastService.show(`${member.email} is now ${role}`, 'success');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to update role', 'error');
        }
    }

    async removeMember(member: ProjectMember) {
        try {
            await this.memberService.delete(member.id);
            this.toastService.show(`${member.email} removed from project`, 'success');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to remove member', 'error');
        }
    }

    async revokeInvite(invite: ProjectInvitation) {
        try {
            await this.invitationService.delete(invite.id);
            this.toastService.show('Invitation revoked', 'success');
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to revoke invitation', 'error');
        }
    }
}
