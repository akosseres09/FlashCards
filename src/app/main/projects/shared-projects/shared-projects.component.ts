import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ProjectListComponent } from '../project-list/project-list.component';
import { filter, switchMap, combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '@angular/fire/auth';
import { AuthService } from '../../../services/auth/auth.service';
import { ProjectService } from '../../../services/project/project.service';
import { ProjectMemberService } from '../../../services/project-member/project-member.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Project } from '../../../models/Project';
import { ProjectMember } from '../../../models/ProjectMember';

@Component({
    selector: 'app-shared-projects',
    imports: [ProjectListComponent],
    templateUrl: './shared-projects.component.html',
    styleUrl: './shared-projects.component.scss',
    host: {
        class: 'flex-1 flex flex-col',
    },
})
export class SharedProjectsComponent implements OnInit {
    private readonly projectService = inject(ProjectService);
    private readonly memberService = inject(ProjectMemberService);
    private readonly authService = inject(AuthService);
    private readonly toastService = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    isLoading = signal<boolean>(true);
    sharedProjects = signal<Project[]>([]);
    myMemberships = signal<ProjectMember[]>([]);

    roleMap = computed<Record<string, string>>(() =>
        Object.fromEntries(this.myMemberships().map((m) => [m.projectId, m.role])),
    );

    ngOnInit() {
        this.authService.user$
            .pipe(
                filter((user): user is User => !!user),
                switchMap((user) =>
                    combineLatest([
                        this.projectService.getSharedProjects(user.uid),
                        this.memberService.getMyMemberships(user.uid),
                    ]),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: ([sharedProjects, memberships]) => {
                    this.sharedProjects.set(sharedProjects);
                    this.myMemberships.set(memberships);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error(err);
                    this.toastService.show('Failed to load shared projects', 'error');
                    this.isLoading.set(false);
                },
            });
    }
}
