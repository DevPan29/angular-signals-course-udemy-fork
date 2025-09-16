import {afterNextRender, Component, computed, effect, EffectRef, inject, Injector, OnInit, signal} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {catchError, from, throwError} from "rxjs";
import {toObservable, toSignal, outputToObservable, outputFromObservable} from "@angular/core/rxjs-interop";
import {CoursesServiceWithFetch} from "../services/courses-fetch.service";
import {openEditCourseDialog} from "../edit-course-dialog/edit-course-dialog.component";
import {LoadingService} from "../loading/loading.service";


@Component({
  selector: 'home',
  imports: [
    MatTabGroup,
    MatTab,
    CoursesCardListComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  #courses = signal<Course[]>([]);

  dialog = inject(MatDialog)

  // coursesService = inject(CoursesServiceWithFetch);
  coursesService = inject(CoursesService);

  beginnerCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(course => course.category === "BEGINNER");
  })

  advancedCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(course => course.category === "ADVANCED");
  })

  messageService = inject(MessagesService)

  constructor() {
    effect(() => {
      /* console.log(`Beginner courses: `, this.beginnerCourses())
      console.log(`Advanced courses: `, this.advancedCourses()) */
    })
    this.loadCourses()
      .then(() => console.log(`All courses loaded:`, this.#courses()));
  }

  async loadCourses() {
    try {
      const courses = await this.coursesService.loadAllCourses();
      this.#courses.set(courses.sort(sortCoursesBySeqNo));
    } catch (err) {
      this.messageService.showMessage(`Error loading courses!`, "error")
      console.error(err)
    }
  }


  onCourseUpdated(updateCourse: Course) {
    const courses = this.#courses();
    const newCourses = courses.map(course => (
      course.id === updateCourse.id ? updateCourse : course
    ))
    this.#courses.set(newCourses);
  }

  async onCourseDeleted(courseId: string) {
    try {
      await this.coursesService.deleteCourse(courseId);
      const courses = this.#courses();
      const newCourses = courses.filter(course => course.id !== courseId);
      this.#courses.set(newCourses);

    } catch (err) {
      console.error(err);
      alert(`Error loading course deleted!`);
    }
  }

  async onAddCourse() {
    const newCourse = await openEditCourseDialog(
      this.dialog,
      {
        mode: "create",
        title: "Create New Course"
      })
    if (!newCourse) {
      return;
    }
    const newCourses = [
      ...this.#courses(),
      newCourse
    ];
    this.#courses.set(newCourses);

  }

  injector = inject(Injector)

  onToObservableExample() {
    const courses$ = toObservable(this.#courses, {injector: this.injector});
    courses$.subscribe(courses => {
      console.log(`courses$`, courses)
    })
  }
}
