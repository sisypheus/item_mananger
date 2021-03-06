import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { LoadingService } from '../loading.service';
import { FormComponent } from '../form/form.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Item } from '../Item';
import { ItemService } from '../item.service';
import { FormHandlerService } from '../form-handler.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  host: {
    '(document:mouseup)': 'onPageClick($event)'
  }
})
export class HomeComponent implements OnInit {
  public items: Item[] = [];
  public actionsRequest: boolean = false;
  public category: string = "All";

  public selectedItem!: Item;
  //child functions
  @ViewChild(FormComponent)
  private formComponent!: FormComponent;

  constructor(private ItemService: ItemService, private FormService: FormHandlerService, public Loading: LoadingService) {}

  ngOnInit() {
    this.getItems();
  }

  public triggerRefresh(): void {
    this.getItems();
  }

  public requestEdit(): void {
    this.formComponent.setItemEdit(this.selectedItem);
    this.formComponent.setForm();
    this.FormService.show = true;
  }

  public requestDelete(): void {
    this.deleteItem(this.selectedItem);
  }

  public setCategory(category: string): void {
    this.category = category;
    this.getItems();
  }

  //page event functions

  public onPageClick(event: Event): void {
    if (!this.actionsRequest)
      return;
    const target = event.target as HTMLElement;
    if (target) {
      if (target.id !== "popover" && target.id !== "moreActions") {
        this.actionsRequest = false;
        document.getElementById("popover")?.classList?.add("hidden");
      }
    }
  }

  @HostListener('window:scroll',[]) onPageScroll(): void {
    if (!this.actionsRequest)
      return;
    this.actionsRequest = false;
    let popover = document.getElementById("popover");
    popover?.classList?.add("hidden");
  }

  public itemActions(element: Event, item: Item): void {
    this.actionsRequest = true;
    this.selectedItem = item;
    const target = element.target as HTMLElement;
    let {x, y} = target.getBoundingClientRect();
    let popover = document.getElementById("popover");
    if (!popover)
      return;
    popover.classList.remove("hidden");
    let width = popover.offsetWidth;
    popover.style.left = (x - width + 20) + 'px';
    popover.style.top = y + 'px';
  }

  public getItems(): void {
    this.ItemService.getItemsByCategory(this.category).subscribe(
      (response: Item[]) => {
        this.items = response;
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  public addItem(item: Item): void {
    this.ItemService.modifyCount(item, +item.count+1).subscribe(
      (_: any) => {
        this.getItems();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  public removeItem(item: Item): void {
    this.ItemService.modifyCount(item, +item.count-1).subscribe(
      (response: any) => {
        this.getItems();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  public deleteItem(item: Item): void {
    this.ItemService.deleteItem(item.id).subscribe(
      (response: any) => {
        this.getItems();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }
}
