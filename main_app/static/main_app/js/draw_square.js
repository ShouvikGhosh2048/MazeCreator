function drawSquare(ctx,x,y,size,type,alpha = 1.0){
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillRect(x, y, size, size);
    switch(type){
        case 'E':
            break;
        case 'B':
            ctx.fillStyle = `rgba(50,30,0,${alpha})`;
            ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
            ctx.fillStyle = `rgba(100,60,0,${alpha})`;
            ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
            ctx.fillStyle = `rgba(180,100,0,${alpha})`;
            ctx.fillRect(x + 11, y + 11, size - 22, size - 22);
            break;
        case 'P':
            ctx.fillStyle = `rgba(100,100,255,${alpha})`;
            ctx.fillRect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8);
            ctx.fillStyle = `rgba(50,50,205,${alpha})`;
            ctx.fillRect(x + size * 0.4, y + size * 0.4, size * 0.2, size * 0.2);
            ctx.fillStyle = `rgba(0,0,155,${alpha})`;
            ctx.fillRect(x + size * 0.2, y + size * 0.45, size * 0.1, size * 0.1);
            ctx.fillRect(x + size * 0.7, y + size * 0.45, size * 0.1, size * 0.1);
            ctx.fillRect(x + size * 0.45, y + size * 0.2, size * 0.1, size * 0.1);
            ctx.fillRect(x + size * 0.45, y + size * 0.7, size * 0.1, size * 0.1);
            break;
        case 'C':
            ctx.fillStyle = `rgba(236,206,17,${alpha})`;
            ctx.fillRect(x + size * 0.2, y + size * 0.2, size * 0.6, size * 0.6);
            ctx.fillStyle = `rgba(190,160,0,${alpha})`;
            ctx.fillRect(x + size * 0.32, y + size * 0.32, size * 0.36, size * 0.12);
            ctx.fillRect(x + size * 0.32, y + size * 0.32, size * 0.12, size * 0.36);
            ctx.fillRect(x + size * 0.32, y + size * 0.56, size * 0.36, size * 0.12);
            break;
        case 'G':
            ctx.fillStyle = `rgba(35,194,3,${alpha})`;
            ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
            ctx.fillStyle = `rgba(0,124,0,${alpha})`;
            ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
            break;
        case 'T':
            ctx.fillStyle = `rgba(170,0,240,${alpha})`;
            ctx.fillRect(x + size * 0.2, y + size * 0.2, size * 0.6, size * 0.6);
            ctx.fillStyle = `rgba(40,0,100,${alpha})`;
            ctx.fillRect(x + size * 0.32, y + size * 0.32, size * 0.36, size * 0.12);
            ctx.fillRect(x + size * 0.44, y + size * 0.32, size * 0.12, size * 0.36);
            break;
    }
}