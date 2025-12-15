import { inject, Injectable } from '@angular/core';
import {
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    doc,
    docData,
    Firestore,
    query,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from '@angular/fire/firestore';
import { Project } from '../../models/Project';
import { merge, Observable, reduce } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    PROJECTS_COLLECTION = 'projects';
    firestore = inject(Firestore);

    getOne(id: string) {
        const ref = doc(collection(this.firestore, this.PROJECTS_COLLECTION), id);
        return docData(ref) as Observable<Project>;
    }

    getAll() {
        return collectionData(collection(this.firestore, this.PROJECTS_COLLECTION)) as Observable<
            Project[]
        >;
    }

    getOwnProjects(userId: string) {
        const ref = collection(this.firestore, this.PROJECTS_COLLECTION);
        const q = query(ref, where('createdBy', '==', userId));
        return collectionData(q) as Observable<Project[]>;
    }

    addOne(project: Project) {
        const ref = doc(collection(this.firestore, this.PROJECTS_COLLECTION));
        project.id = ref.id;
        return setDoc(ref, project);
    }

    update(id: string, project: Partial<Project>) {
        const ref = doc(this.firestore, this.PROJECTS_COLLECTION + `/${id}`);
        return updateDoc(ref, project);
    }

    delete(id: string) {
        const ref = doc(this.firestore, this.PROJECTS_COLLECTION + `/${id}`);
        return deleteDoc(ref);
    }
}
