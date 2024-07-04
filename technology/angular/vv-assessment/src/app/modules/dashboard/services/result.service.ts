import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurl } from 'src/app/core/apiurl';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  appURL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCandidates(page: number = 1, limit: number = 5, search: string): any {
    return this.http.get(this.appURL + apiurl.API_GET_CANDIDATES + "?page=" + page + '&limit=' + limit + '&search=' + search);
  }

  fetchAnswers(userId: string): any {
    return this.http.get(this.appURL + apiurl.API_FETCH_ANSWERS + "?userId=" + userId);
  }

  getAllQuestions(page: number = 1, limit: number = 10, search: string, category: string, level: string): any {
    return this.http.get(this.appURL + apiurl.API_FETCH_QUESTIONS + "?page=" + page + '&limit=' + limit + '&search=' + search + '&category=' + category + '&level=' + level);
  }

  getTopCandidates(page: number = 1, limit: number = 10, target: string, search: string): any {
    return this.http.get(this.appURL + apiurl.API_TOP_CANDIDATES + "?page=" + page + '&limit=' + limit + "&target=" + target + "&search=" + search);
  }

  updateCandidate(data: any): any {
    return this.http.patch(this.appURL + apiurl.API_UDPATE_CANDIDATE, data);
  }

  updateQuestion(data: any): any {
    return this.http.patch(this.appURL + apiurl.API_UDPATE_QUESTION, data);
  }

  deleteCandidate(userId: string): any {
    return this.http.delete(this.appURL + apiurl.API_DELETE_CANDIDATE + "?userId=" + userId);
  }

  deleteQuestion(id: string): any {
    return this.http.delete(this.appURL + apiurl.API_DELETE_QUESTION + "?id=" + id);
  }

  uploadQuestions(data: any) {
    return this.http.post(this.appURL + apiurl.API_UPLOAD_QUESTIONS, data);
  }

}
