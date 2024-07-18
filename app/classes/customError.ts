export class CustomError extends Error {
    additionalInfo = {};
    constructor(message: string, additionalInfo: any|undefined = undefined) {
        super(message);
        this.name = "CustomError";
        this.additionalInfo = additionalInfo;
    }
}