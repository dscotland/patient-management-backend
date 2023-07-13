import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

export class UtilitiesService {
    generateUUID(){
        return uuidv4();
    }

    getCurrentDateTime(){
        return moment.utc().toISOString()
    }
}