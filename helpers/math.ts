export const average = (numbers: number[]): number => {
    return numbers.reduce((accumulator: number, item: number ) => accumulator + item, 0) / numbers.length;
};

/**
 * Рассчитать процент понижения
 * @param newValue Новое значение, для которого производится расчет
 * @param oldValue Эталонное значение (сравниваемое)
 */
export const percentageDecrease = (newValue: number, oldValue: number): number => {
    return (oldValue - newValue) / oldValue * 100;
};
