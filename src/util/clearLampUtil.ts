
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