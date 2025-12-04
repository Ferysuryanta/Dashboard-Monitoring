import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { Activity } from '../../models/activity.model';
import {ActivityService} from "../../../../core/services/activity.service";
import {MatCard} from "@angular/material/card";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatChip} from "@angular/material/chips";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-activity-detail',
    templateUrl: './activity-detail.component.html',
    imports: [
        MatCard,
        DatePipe,
        NgIf,
        MatChip,
        NgClass,
        NgForOf,
        RouterLink,
        MatButton
    ],
    styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit {

    activity?: Activity;
    loading = true;

    constructor(private route: ActivatedRoute, private svc: ActivityService, private router: Router) {}

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.svc.getById(id).subscribe(r => {
            this.activity = r;
            this.loading = false;
        });
    }

    back() { this.router.navigate(['/activities']); }
}