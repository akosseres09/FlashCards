import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth/auth.service';
import { ProjectService } from '../../../services/project/project.service';
import { InvitationService } from '../../../services/invitation/invitation.service';
import { ToastService } from '../../../services/toast/toast.service';
import { ProjectInvitationData } from '../../../models/schema/db';
import { ProjectRole } from '../../../models/ProjectMember';
import { Project } from '../../../models/Project';

const ROLE_OPTIONS: { label: string; value: ProjectRole; description: string }[] = [
    { label: 'Viewer', value: 'viewer', description: 'Can study cards, cannot edit' },
    { label: 'Editor', value: 'editor', description: 'Can add, edit, and delete cards' },
    { label: 'Admin', value: 'admin', description: 'Editor + can invite and manage members' },
];

@Component({
    selector: 'app-invite',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        LucideAngularModule,
        ButtonModule,
        InputText,
        SelectModule,
    ],
    templateUrl: './invite.component.html',
    styleUrl: './invite.component.scss',
    host: {
        class: 'flex-1 flex flex-col',
    },
})
export class InviteComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly projectService = inject(ProjectService);
    private readonly invitationService = inject(InvitationService);
    private readonly toastService = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly fb = inject(FormBuilder);

    readonly projectId = input.required<string>();

    readonly project = signal<Project | null>(null);
    readonly isSaving = signal(false);
    readonly roleOptions = ROLE_OPTIONS;

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        role: ['editor' as ProjectRole, Validators.required],
    });

    get currentUser() {
        return this.authService.getUser();
    }

    ngOnInit() {
        this.projectService
            .getOne(this.projectId())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((project) => this.project.set(project));
    }

    async onSubmit() {
        if (this.form.invalid) return;

        const project = this.project();
        const projectId = this.projectId();
        const user = this.currentUser;
        if (!project || !user || project.id !== projectId) return;

        this.isSaving.set(true);
        const { email, role } = this.form.getRawValue();

        const invitation: ProjectInvitationData = {
            projectId: project.id,
            projectName: project.name,
            invitedEmail: email!.toLowerCase().trim(),
            invitedBy: user.uid,
            invitedByName: user.displayName ?? user.email ?? '',
            role: role as ProjectRole,
            createdAt: new Date(),
            status: 'pending',
        };

        try {
            await this.invitationService.create(invitation);
            this.toastService.show(`Invitation sent to ${email}`, 'success');
            this.form.reset({ email: '', role: 'editor' });
        } catch (err) {
            console.error(err);
            this.toastService.show('Failed to send invitation', 'error');
        } finally {
            this.isSaving.set(false);
        }
    }
}
