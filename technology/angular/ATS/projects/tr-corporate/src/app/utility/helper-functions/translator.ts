import { TranslatePipe } from '@cloudtalentrecruit/ng-core';

interface Iobj {
    [key: string]: string
}

const translate = (langObj: Iobj, lang?: string): Iobj => {
    let buildObj = {};
    for (const key in langObj) {
        if (Object.prototype.hasOwnProperty.call(langObj, key)) {
            const element = langObj[key];
            let newObj: any = {};
            var translatePipe = new TranslatePipe;
            newObj[key] = translatePipe.transform(key);
            buildObj = { ...buildObj, newObj }
        }
    }

    return buildObj;
}

export default translate;