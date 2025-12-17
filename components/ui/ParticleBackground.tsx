'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface Particle {
    x: number;
    y: number;
    dx: number;
    dy: number;
    size: number;
    // Grid cell for spatial partitioning
    cellX: number;
    cellY: number;
}

// Spatial partitioning grid cell size
const CELL_SIZE = 150;
// Max connection distance
const MAX_DISTANCE = 120;
// Reduced particle count for performance
const MAX_PARTICLES = 80;
// Target FPS for particle calculations
const TARGET_FPS = 30;
const FRAME_DURATION = 1000 / TARGET_FPS;

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    const themeRef = useRef(theme);

    // Keep theme in sync
    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    const getColors = useCallback(() => {
        const isDark = themeRef.current === 'dark';
        return {
            background: isDark
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
            particle: isDark
                ? 'rgba(59, 130, 246, 0.6)'
                : 'rgba(59, 130, 246, 0.5)',
            line: isDark
                ? 'rgba(148, 163, 184, 0.15)'
                : 'rgba(100, 116, 139, 0.2)',
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let lastFrameTime = 0;
        let mouseX = 0;
        let mouseY = 0;

        // Spatial partitioning grid
        let grid: Map<string, Particle[]> = new Map();
        let gridCols = 0;
        let gridRows = 0;

        const getGridKey = (cellX: number, cellY: number): string => `${cellX},${cellY}`;

        const updateParticleCell = (particle: Particle) => {
            particle.cellX = Math.floor(particle.x / CELL_SIZE);
            particle.cellY = Math.floor(particle.y / CELL_SIZE);
        };

        const buildGrid = () => {
            grid.clear();
            particles.forEach(particle => {
                updateParticleCell(particle);
                const key = getGridKey(particle.cellX, particle.cellY);
                if (!grid.has(key)) {
                    grid.set(key, []);
                }
                grid.get(key)!.push(particle);
            });
        };

        const getNeighborParticles = (particle: Particle): Particle[] => {
            const neighbors: Particle[] = [];
            // Check current cell and adjacent cells
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const key = getGridKey(particle.cellX + dx, particle.cellY + dy);
                    const cellParticles = grid.get(key);
                    if (cellParticles) {
                        neighbors.push(...cellParticles);
                    }
                }
            }
            return neighbors;
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gridCols = Math.ceil(canvas.width / CELL_SIZE);
            gridRows = Math.ceil(canvas.height / CELL_SIZE);
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            // Responsive particle count based on screen size
            const area = window.innerWidth * window.innerHeight;
            const particleCount = Math.min(
                Math.floor(area / 15000), // 1 particle per 15000px²
                MAX_PARTICLES
            );

            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push({
                    x,
                    y,
                    dx: (Math.random() - 0.5) * 0.4,
                    dy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 2 + 1,
                    cellX: Math.floor(x / CELL_SIZE),
                    cellY: Math.floor(y / CELL_SIZE),
                });
            }
            buildGrid();
        };

        const drawParticles = (timestamp: number) => {
            // Throttle to target FPS
            const elapsed = timestamp - lastFrameTime;
            if (elapsed < FRAME_DURATION) {
                animationFrameId = requestAnimationFrame(drawParticles);
                return;
            }
            lastFrameTime = timestamp - (elapsed % FRAME_DURATION);

            const colors = getColors();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Rebuild spatial grid
            buildGrid();

            // Draw connection lines using spatial partitioning (O(n) instead of O(n²))
            ctx.lineWidth = 0.5;
            const drawnConnections = new Set<string>();

            particles.forEach((particle) => {
                const neighbors = getNeighborParticles(particle);

                neighbors.forEach((neighbor) => {
                    if (particle === neighbor) return;

                    // Avoid drawing duplicate connections
                    const connectionKey = particle.x < neighbor.x
                        ? `${particle.x},${particle.y}-${neighbor.x},${neighbor.y}`
                        : `${neighbor.x},${neighbor.y}-${particle.x},${particle.y}`;

                    if (drawnConnections.has(connectionKey)) return;

                    const dx = particle.x - neighbor.x;
                    const dy = particle.y - neighbor.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < MAX_DISTANCE) {
                        drawnConnections.add(connectionKey);
                        const alpha = (1 - distance / MAX_DISTANCE) * 0.3;
                        ctx.beginPath();
                        ctx.strokeStyle = themeRef.current === 'dark'
                            ? `rgba(148, 163, 184, ${alpha})`
                            : `rgba(100, 116, 139, ${alpha})`;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(neighbor.x, neighbor.y);
                        ctx.stroke();
                    }
                });
            });

            // Draw particles and update positions
            particles.forEach((particle) => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = colors.particle;
                ctx.fill();

                // Update position
                particle.x += particle.dx;
                particle.y += particle.dy;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;

                // Keep within bounds
                particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                particle.y = Math.max(0, Math.min(canvas.height, particle.y));

                // Mouse interaction (gentle push)
                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 80 && distance > 0) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (80 - distance) / 80;
                    particle.dx -= forceDirectionX * force * 0.3;
                    particle.dy -= forceDirectionY * force * 0.3;

                    // Dampen velocity to prevent runaway particles
                    particle.dx *= 0.99;
                    particle.dy *= 0.99;
                }
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        // Use passive event listeners for better scroll performance
        window.addEventListener('resize', resizeCanvas, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        resizeCanvas();
        animationFrameId = requestAnimationFrame(drawParticles);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [getColors]);

    // Theme-aware background gradient
    const backgroundStyle = theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)';

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{
                zIndex: -1,
                background: backgroundStyle,
                willChange: 'transform',
            }}
        />
    );
}
