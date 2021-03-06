import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';

import {AngularIndexedDB} from 'angular2-indexeddb';
import { Item } from './item';
import { EventEmitter } from '@angular/core';

@Injectable()
export class ItemService {
  private _db: AngularIndexedDB;
  private readonly _dbName: string = 'CacheitDb';
  private readonly _storeName: string = 'item';
  private readonly _storeOptions: object = { keyPath: 'id' };
  private readonly _added: EventEmitter<Item> = new EventEmitter();
  private readonly _deleted: EventEmitter<Item> = new EventEmitter();

  private _openDb(): Observable<AngularIndexedDB> {
    console.log(`Open ${this._dbName}...`);
    return fromPromise(this._db.openDatabase(1, (evt) => {
        evt.currentTarget.result.createObjectStore(this._storeName,  this._storeOptions);
    }));
  }

  constructor() {
    this._db = new AngularIndexedDB(this._dbName, 1);
  }

  get added(): Observable<Item> {
    return this._added.asObservable();
  }

  get deleted(): Observable<Item> {
    return this._deleted.asObservable();
  }

  getAll(): Observable<Item[]> {
    return this._openDb().pipe(
      mergeMap(db => fromPromise(this._db.getAll(this._storeName))),
      map(objects => objects.map(object => Item.loadFromObject(object))),
    );
  }

  add(item: Item): void {
    this._db.add(this._storeName, item).then((evt) => {
      evt.value.id = evt.key;
      this._added.emit(evt.value);
    }, (error) => {
        console.log(error);
    });
  }

  delete(item: Item): void {
    this._db.delete(this._storeName, item.id).then((evt) => {
      this._deleted.emit(item);
    }, (error) => {
        console.log(error);
    });
  }

}
