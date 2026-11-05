export default class ErreurAPI extends Error {
    constructor(message, statutCode) {
        super(message);

        this.statutCode = statutCode;
    }
}