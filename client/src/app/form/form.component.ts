import { ImageUploadService } from './../image-upload.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormHandlerService } from '../form-handler.service';
import { finalize } from 'rxjs/operators';
import { ItemService } from '../item.service';
import { Item } from '../Item';
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent {
  public myForm!: FormGroup;
  public file: File | null = null;
  public itemEdit: Item | null = null;
  @Output() triggerItemsFetchingEmitter = new EventEmitter<boolean>(false);

  constructor(private ImageService: ImageUploadService, private ItemService: ItemService, public FormService: FormHandlerService, private FormBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.myForm = this.FormBuilder.group({
      id: '',
      name: '',
      stock: 0,
      price: 0,
      category: '',
      description: '',
      image: '',
    });
  }

  public setItemEdit(item: Item): void {
    this.itemEdit = item;
  }

  public setForm(): void {
    if (this.itemEdit)
      this.myForm.patchValue({ id: this.itemEdit.id, name: this.itemEdit.name, price: this.itemEdit.price, stock: this.itemEdit.count, category: this.itemEdit.category, description: this.itemEdit.description, image: this.itemEdit.image });
  }

  onClose(): void {
    this.FormService.close();
    this.cleanForm(false);
  }

  public formSubmit(): void {
    const item: Item = {
      id: this.myForm.value.id,
      name: this.myForm.value.name,
      price: this.myForm.value.price,
      count: this.myForm.value.stock,
      category: this.myForm.value.category,
      description: this.myForm.value.description,
      image: this.myForm.value.image
    };

    if (!this.itemEdit)
      this.createItem(this.file, item);
    else
      this.editItem(this.file, item);
    this.itemEdit = null;
  }

  public async createItem(file: File | null, item: Item): Promise<void> {
    if (file) {
      item.image = await this.ImageService.getDownloadUrl(file);
      this.ItemService.createItem(item).subscribe(
        (item: Item) => this.cleanForm(true),
        (error: HttpErrorResponse) => console.log(error)
      );
      return;
    }
    this.ItemService.createItem(item).subscribe(
      (item: Item) => this.cleanForm(true),
      (error: HttpErrorResponse) => console.log(error)
    );
  }

  public async editItem(file: File | null, item: Item): Promise<void> {
    if (file) {
      item.image = await this.ImageService.getDownloadUrl(file);
      this.ItemService.modifyItem(item).subscribe(
        (item: Item) => this.cleanForm(true),
        (error: HttpErrorResponse) => console.log(error)
      );
      return;
    }
    this.ItemService.modifyItem(item).subscribe(
      (item: Item) => this.cleanForm(true),
      (error: HttpErrorResponse) => console.log(error)
    );
  }

  cleanForm(refresh: Boolean): void {
    this.myForm.reset({
      id:'', name: '', price: 0, image: '', stock: 0, category: '', description: ''
    });
    this.FormService.close();
    this.file = null;
    if (refresh)
      this.triggerItemsFetchingEmitter.emit(true);
  }

  addCount(): void {
    this.myForm.patchValue({ stock: this.myForm.value.stock + 1 });
  }

  substractCount(): void {
    if (this.myForm.value.stock <= 0)
      return;
    this.myForm.patchValue({ stock: this.myForm.value.stock - 1 });
  }

  setImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    if (files) {
      const file = files.item(0);
      if (file)
        this.file = file;
    }
  }

  getFormState(): boolean {
    return this.FormService.show;
  }
}
