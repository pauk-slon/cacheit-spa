import { Observable } from 'rxjs/Observable';
import { fromEvent } from 'rxjs/observable/fromEvent';


export class Item {
    public id: string;
    public name: string;
    public type: string;
    private data: ArrayBuffer;
    private _url: string;

    private constructor() {}

    get size(): number { return this.data.byteLength; }

    get url(): string {
        if (!this._url) {
            const blob = new Blob([new Uint8Array(this.data)], {type: this.type});
            this._url = URL.createObjectURL(blob);
        }
        return this._url;
    }

    static loadFromFile(file: File): Observable<Item> {
        return Observable.create((observer) => {
            const fileReader = new FileReader();
            fileReader.onload = (event: any) => {
                observer.next(Item.loadFromObject({
                    id: `${file.size}`,
                    name: file.name,
                    type: file.type,
                    data: event.target.result,
                }));
                observer.complete();
            };
            fileReader.readAsArrayBuffer(file);
        });
    }

    static loadFromObject(object): Item {
        const item = new Item();
        Object.assign(item, object);
        return item;
    }
}
