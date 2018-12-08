
export function length(v) {
    return Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));

}

export function normalize(v) {
    let l = length(v);
    return {x: v.x / l, y: v.y / l};
}

export function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function areNear(a, b, maxDistance) {
    return distance(a, b) < maxDistance;
}
