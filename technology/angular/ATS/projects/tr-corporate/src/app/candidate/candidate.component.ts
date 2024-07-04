import { Component, OnInit } from '@angular/core';
import { CANDIDATE_LN } from './shared/candidate.lang';

@Component({
  selector: 'app-candidate',
  templateUrl: './candidate.component.html',
  styleUrls: ['./candidate.component.scss']
})
export class CandidateComponent implements OnInit {

  ln = CANDIDATE_LN;
  
  constructor() { }

  ngOnInit(): void {
  }

}
