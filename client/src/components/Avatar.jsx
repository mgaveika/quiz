export default function Avatar(props) {
    const char = props.name?.[0] || 'a'
    const colorsList = {
        a: '#F44336',
        b: '#E91E63',
        c: '#9C27B0',
        d: '#673AB7',
        e: '#3F51B5',
        f: '#2196F3',
        g: '#03A9F4',
        h: '#00BCD4',
        i: '#009688',
        j: '#4CAF50',
        k: '#8BC34A',
        l: '#CDDC39',
        m: '#FFEB3B',
        n: '#FFC107',
        o: '#FF9800',
        p: '#FF5722',
        q: '#795548',
        r: '#9E9E9E',
        s: '#607D8B',
        t: '#F06292',
        u: '#BA68C8',
        v: '#7986CB',
        w: '#4DB6AC',
        x: '#AED581',
        y: '#FFD54F',
        z: '#A1887F'
    }
    const convertedLetter = char.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    const color = colorsList[convertedLetter] || "#F44336"
    const size = props.size || "20px"
    const sizeFont = props.fontSize || "10px"
    return (
        <div
            style={{
                backgroundColor: color,
                width: size,
                height: size,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: sizeFont,
                userSelect: 'none',
                ...(props.outline ? { outline: props.outline } : {})
            }}
            >
            {char.toUpperCase()}
        </div>
    )
}