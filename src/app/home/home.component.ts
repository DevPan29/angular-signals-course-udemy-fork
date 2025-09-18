import {
  afterNextRender,
  Component,
  computed,
  effect,
  EffectRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {catchError, from, interval, startWith, throwError} from "rxjs";
import {toObservable, toSignal, outputToObservable, outputFromObservable} from "@angular/core/rxjs-interop";
import {CoursesServiceWithFetch} from "../services/courses-fetch.service";
import {openEditCourseDialog} from "../edit-course-dialog/edit-course-dialog.component";
import {LoadingService} from "../loading/loading.service";
import {MatTooltip} from "@angular/material/tooltip";


@Component({
  selector: 'home',
  imports: [
    MatTabGroup,
    MatTab,
    CoursesCardListComponent,
    MatTooltip
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

  courses$ = from(this.coursesService.loadAllCourses())

  onToSignalExample() {
    try {
      const courses$ = from(this.coursesService.loadAllCourses())
        .pipe(
          catchError(err => {
            console.log(`Error caught in catchError`, err)
            throw err;
          })
        );
      const courses = toSignal(courses$, {
        injector: this.injector,
      })
      effect(() => {
        console.log(`Courses: `, courses())
      }, {
        injector: this.injector
      })

      setInterval(() => {
        console.log(`Reading courses signal: `, courses())
      }, 1000)

    }
    catch (err) {
      console.log(`Error in catch block: `, err)
    }

  }

  onToObservableExample() {
    const numbers = signal(0);
    numbers.set(1)
    numbers.set(2)
    numbers.set(3)
    const numbers$ = toObservable(numbers, {
      injector: this.injector
    });
    numbers.set(4)
    numbers$.subscribe(val => console.log(`numbers$: `, val));
    numbers.set(5)
  }
}
