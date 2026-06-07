import { getArrivalDate } from '../time';

describe('getArrivalDate', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-06-07T12:00:00'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should parse normal arrival times', () => {
        const arrivalTime = '14:30:00';
        const date = getArrivalDate(arrivalTime);
        expect(date.getHours()).toBe(14);
        expect(date.getMinutes()).toBe(30);
        expect(date.getSeconds()).toBe(0);
        expect(date.getDate()).toBe(7);
    });

    it('should handle arrival times >= 24:00:00 by moving to the next day', () => {
        const arrivalTime = '25:30:00'; // 1:30 AM next day
        const date = getArrivalDate(arrivalTime);
        expect(date.getHours()).toBe(1);
        expect(date.getMinutes()).toBe(30);
        expect(date.getSeconds()).toBe(0);
        expect(date.getDate()).toBe(8);
    });

    it('should handle arrival times like 24:00:00 as midnight next day', () => {
        const arrivalTime = '24:00:00';
        const date = getArrivalDate(arrivalTime);
        expect(date.getHours()).toBe(0);
        expect(date.getMinutes()).toBe(0);
        expect(date.getSeconds()).toBe(0);
        expect(date.getDate()).toBe(8);
    });
});
