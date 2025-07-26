export default function Icons(props) {
    if (props.icon === "dropdown-arrow") {
        return (
            <svg className={`${props.className}`} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        )
    } else if (props.icon === "plus") {
        return ( 
            <svg className={`${props.className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" /></svg> 
        )
    } else if (props.icon === "bin") {
        return (
            <svg className={`${props.className}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 3V4H4V6H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V6H20V4H15V3H9ZM7 6H17V20H7V6ZM9 8V18H11V8H9ZM13 8V18H15V8H13Z" />
            </svg>
        )
    } else if (props.icon === "pen") {
        return (
            <svg className={`${props.className}`} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
            </svg>
        )
    } else if (props.icon === "trophy") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className={`${props.className}`}>
            <circle cx="12" cy="8" r="7"/>
            <path d="M8 16l-2 6 6-3 6 3-2-6"/>
            </svg>
        )
   } else {
        return (
            <span>Unknown icon</span>
        )
    }
}