import {Component, computed, effect, inject, Injector, signal} from '@angular/core';
import {CoursesService} from "../services/courses.service";
import {Course, sortCoursesBySeqNo} from "../models/course.model";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {CoursesCardListComponent} from "../courses-card-list/courses-card-list.component";
import {MatDialog} from "@angular/material/dialog";
import {MessagesService} from "../messages/messages.service";
import {catchError, from, throwError} from "rxjs";
import {toObservable, toSignal, outputToObservable, outputFromObservable} from "@angular/core/rxjs-interop";

type Counter = {
  value: number
}

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

  counter = signal(0);

  tenXCounter = computed(() => {
    const val = this.counter();
    return val * 10;
  })

  hundredXCounter = computed(() => {
    const val = this.tenXCounter();
    return val * 10;
  })

  increment() {

    this.counter.update(val => val + 1);
  }

}
