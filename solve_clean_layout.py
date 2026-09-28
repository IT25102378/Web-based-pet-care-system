import math

def check_layout(entities, relationships, attributes, connections):
    shapes = {}
    for e in entities:
        shapes[e[0]] = ('rect', e[2], e[3], e[4], e[5], e[1])
    for r in relationships:
        shapes[r[0]] = ('diamond', r[2], r[3], r[4]*2, r[5]*2, r[1])
    for a in attributes:
        key = f"ATTR_{a[0]}_{a[1]}"
        shapes[key] = ('ellipse', a[2], a[3], a[6]*2, a[7]*2, a[1])

    def dist_point_to_segment(px, py, x1, y1, x2, y2):
        dx = x2 - x1
        dy = y2 - y1
        if dx == 0 and dy == 0:
            return math.hypot(px - x1, py - y1)
        t = max(0, min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
        proj_x = x1 + t * dx
        proj_y = y1 + t * dy
        return math.hypot(px - proj_x, py - proj_y)

    def segment_intersects_ellipse(x1, y1, x2, y2, cx, cy, rw, rh, margin=4):
        rw += margin
        rh += margin
        for i in range(1, 50):
            t = i / 50.0
            x = x1 + t * (x2 - x1)
            y = y1 + t * (y2 - y1)
            if ((x - cx) / rw) ** 2 + ((y - cy) / rh) ** 2 < 1.0:
                return True
        return False

    def segment_intersects_box(x1, y1, x2, y2, cx, cy, w, h, margin=4):
        left = cx - w/2 - margin
        right = cx + w/2 + margin
        top = cy - h/2 - margin
        bottom = cy + h/2 + margin
        for i in range(1, 50):
            t = i / 50.0
            x = x1 + t * (x2 - x1)
            y = y1 + t * (y2 - y1)
            if left <= x <= right and top <= y <= bottom:
                return True
        return False

    lines = []
    for conn in connections:
        u, v = conn[0], conn[1]
        if u in shapes and v in shapes:
            lines.append((f"{u} -> {v}", shapes[u][1], shapes[u][2], shapes[v][1], shapes[v][2], u, v))

    for a in attributes:
        u = a[0]
        v = f"ATTR_{a[0]}_{a[1]}"
        if u in shapes and v in shapes:
            lines.append((f"{u} -> {a[1]}", shapes[u][1], shapes[u][2], shapes[v][1], shapes[v][2], u, v))

    shape_collisions = []
    for lname, x1, y1, x2, y2, u, v in lines:
        for sname, s in shapes.items():
            if sname == u or sname == v:
                continue
            stype, cx, cy, w, h, lbl = s
            hit = False
            if stype == 'ellipse':
                hit = segment_intersects_ellipse(x1, y1, x2, y2, cx, cy, w/2, h/2)
            else:
                hit = segment_intersects_box(x1, y1, x2, y2, cx, cy, w, h)
            if hit:
                shape_collisions.append((lname, f"{sname} ({lbl})"))

    def ccw(A, B, C):
        return (C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0])

    def intersect(A, B, C, D):
        return ccw(A,C,D) != ccw(B,C,D) and ccw(A,B,C) != ccw(A,B,D)

    line_crossings = []
    for i in range(len(lines)):
        for j in range(i+1, len(lines)):
            name1, x1, y1, x2, y2, u1, v1 = lines[i]
            name2, x3, y3, x4, y4, u2, v2 = lines[j]
            if len({u1, v1}.intersection({u2, v2})) > 0:
                continue
            if intersect((x1, y1), (x2, y2), (x3, y3), (x4, y4)):
                line_crossings.append((name1, name2))

    return shape_collisions, line_crossings
