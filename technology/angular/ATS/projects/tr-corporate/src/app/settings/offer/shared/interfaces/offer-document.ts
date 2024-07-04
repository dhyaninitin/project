export interface OfferDocumentI {
    offerdocumentid: string;
    documentname: string;
    documentoriginalname: string;
    extension: string;
    documentpath: string;
    latestversionid: string;
    size: string;
    status: number;
}

export interface OfferUploadJsonI {
    offertemplateid: string;
    documentname: string;
    documentoriginalname: string;
    documentpath: string;
}