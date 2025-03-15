import { ceil } from 'lodash'

export const clearStyle = (clear: number) => {
    let backgroundColor = ''
    let text = ''
    switch (clear) {
        case 0:
            backgroundColor = 'rgb(255, 255, 255)'
            text = 'NoPlay'
            break
        case 1:
            backgroundColor = 'rgb(192, 192, 192)'
            text = 'Failed'
            break
        case 2:
            backgroundColor = 'rgb(149, 149, 255)'
            text = 'AssistEasy'
            break
        case 3:
            backgroundColor = 'rgb(149, 149, 255)'
            text = 'LightAssistEasy'
            break
        case 4:
            backgroundColor = 'rgb(152, 251, 152)'
            text = 'Easy'
            break
        case 5:
            backgroundColor = 'rgb(152, 251, 152)'
            text = 'Normal'
            break
        case 6:
            backgroundColor = 'rgb(255, 99, 71)'
            text = 'Hard'
            break
        case 7:
            backgroundColor = 'rgb(255, 217, 0)'
            text = 'ExHard'
            break
        case 8:
            backgroundColor = 'rgb(255, 140, 0)'
            text = 'FullCombo'
            break
        case 9:
            backgroundColor = 'rgb(255, 140, 0)'
            text = 'Perfect'
            break
        case 10:
            backgroundColor = 'rgb(255, 140, 0)'
            text = 'Max'
            break
        default:
            backgroundColor = ''
            text = ''
    }
    return {
        text,
        backgroundColor,
    }
}

export const getDJLevel = (score: number, notes: number) => {
    const maxScore = notes * 2; // EX SCOREの最大値はノーツ数の2倍
    const ratio = score / maxScore;
    let level = '';
    let colorScheme = '';

    // DJ LEVEL +何点か
    let distance = 0;

    if (ratio >= 8 / 9) {
        level = 'AAA';
        colorScheme = 'green';
        distance = score - (notes * 2 * 8 / 9);
    } else if (ratio >= 7 / 9) {
        level = 'AA';
        colorScheme = 'blue';
        distance = score - (notes * 2 * 7 / 9);
    } else if (ratio >= 6 / 9) {
        level = 'A';
        colorScheme = 'cyan';
        distance = score - (notes * 2 * 6 / 9);
    } else if (ratio >= 5 / 9) {
        level = 'B';
        colorScheme = 'teal';
        distance = score - (notes * 2 * 5 / 9);
    } else if (ratio >= 4 / 9) {
        level = 'C';
        colorScheme = 'yellow';
        distance = score - (notes * 2 * 4 / 9);
    } else if (ratio >= 3 / 9) {
        level = 'D';
        colorScheme = 'orange';
        distance = score - (notes * 2 * 3 / 9);
    } else if (ratio >= 2 / 9) {
        level = 'E';
        colorScheme = 'red';
        distance = score - (notes * 2 * 2 / 9);
    } else {
        level = 'F';
        colorScheme = 'gray';
    }

    return {
        level,
        colorScheme,
        distance: ceil(distance),
    }
};

