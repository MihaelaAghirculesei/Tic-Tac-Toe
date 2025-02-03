function generateCrossSVG() {
    return `
    <svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="10" x2="60" y2="60" stroke="rgb(255, 192, 0)" stroke-width="5">
            <animate 
                attributeName="stroke-dasharray" 
                from="0 70.71" 
                to="70.71 0" 
                dur="0.5s" 
                fill="freeze" 
            />
        </line>
        <line x1="60" y1="10" x2="10" y2="60" stroke="rgb(255, 192, 0)" stroke-width="5">
            <animate 
                attributeName="stroke-dasharray" 
                from="0 70.71" 
                to="70.71 0" 
                dur="0.5s"
                fill="freeze" 
            />
        </line>
    </svg>
    `;
}