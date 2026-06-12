import { useRef, useEffect, useState } from 'react';
import { socket } from './socket';

const Whiteboard = ({ roomId }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const onDrawEvent = (data) => {
            draw(data.x0, data.y0, data.x1, data.y1, data.color, data.size, false);
        };

        socket.on('draw', onDrawEvent);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            socket.off('draw', onDrawEvent);
        };
    }, []);

    const draw = (x0, y0, x1, y1, color, size, emit) => {
        const context = canvasRef.current.getContext('2d');
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = size;
        context.lineCap = 'round';
        context.stroke();
        context.closePath();

        if (!emit) return;

        socket.emit('draw', {
            roomId,
            x0, y0, x1, y1, color, size
        });
    };

    const onMouseDown = (e) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        canvasRef.current.lastX = offsetX;
        canvasRef.current.lastY = offsetY;
    };

    const onMouseMove = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        draw(canvasRef.current.lastX, canvasRef.current.lastY, offsetX, offsetY, color, brushSize, true);
        canvasRef.current.lastX = offsetX;
        canvasRef.current.lastY = offsetY;
    };

    const onMouseUp = () => {
        setIsDrawing(false);
    };

    return (
        <div className="relative w-full h-full flex flex-col">
            <div className="bg-slate-100 p-2 flex gap-4 items-center border-b border-slate-300">
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                />
                <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(e.target.value)}
                    className="w-32"
                />
                <button 
                    onClick={() => {
                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');
                        context.clearRect(0, 0, canvas.width, canvas.height);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                    Clear
                </button>
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseOut={onMouseUp}
                className="flex-1 cursor-crosshair bg-white"
            />
        </div>
    );
};

export default Whiteboard;
