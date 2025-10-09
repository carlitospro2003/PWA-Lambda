import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembersPage } from './members.page';

describe('MembersPage', () => {
  let component: MembersPage;
  let fixture: ComponentFixture<MembersPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MembersPage]
    });
    fixture = TestBed.createComponent(MembersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});