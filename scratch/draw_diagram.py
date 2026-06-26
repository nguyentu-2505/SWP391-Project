import os
from PIL import Image, ImageDraw, ImageFont

# Define image properties
width, height = 1350, 950
image = Image.new("RGB", (width, height), "#121212") # Dark theme background
draw = ImageDraw.Draw(image)

# Load font
try:
    # Windows default fonts supporting Vietnamese
    font_path = "C:\\Windows\\Fonts\\times.ttf"
    font_bold_path = "C:\\Windows\\Fonts\\timesbd.ttf"
    font = ImageFont.truetype(font_path, 13)
    font_bold = ImageFont.truetype(font_bold_path, 15)
    font_small = ImageFont.truetype(font_path, 12)
except Exception:
    font = ImageFont.load_default()
    font_bold = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Helper function to draw rounded rectangles
def draw_rounded_rect(draw, box, radius, fill, outline, width=2):
    x0, y0, x1, y1 = [int(v) for v in box]
    draw.rounded_rectangle([x0, y0, x1, y1], radius, fill=fill, outline=outline, width=width)

# Helper function to draw text aligned to center of a box
def draw_text_centered(draw, text, center, font, fill="white"):
    cx, cy = center
    lines = text.split("\n")
    # Calculate total height of text block
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        line_widths.append(w)
        line_heights.append(h + 4) # add spacing
    
    total_height = sum(line_heights)
    current_y = cy - total_height / 2
    
    for i, line in enumerate(lines):
        w = line_widths[i]
        draw.text((int(cx - w/2), int(current_y)), line, font=font, fill=fill)
        current_y += line_heights[i]

# Helper function to draw an arrow with label
def draw_arrow(draw, start, end, label, font, color="#A1A1AA", offset_label=(0, 0)):
    # Draw line
    draw.line([int(start[0]), int(start[1]), int(end[0]), int(end[1])], fill=color, width=2)
    
    # Calculate arrowhead
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    length = (dx**2 + dy**2)**0.5
    if length == 0:
        return
    ux = dx / length
    uy = dy / length
    
    # Arrowhead points
    arrow_len = 10
    arrow_width = 6
    px = -ux * arrow_len
    py = -uy * arrow_len
    nx = -uy * arrow_width
    ny = ux * arrow_width
    
    ap1 = (int(x2 + px + nx), int(y2 + py + ny))
    ap2 = (int(x2 + px - nx), int(y2 + py - ny))
    draw.polygon([(int(x2), int(y2)), ap1, ap2], fill=color)
    
    # Draw label in the middle of the line
    mx = (x1 + x2) / 2 + offset_label[0]
    my = (y1 + y2) / 2 + offset_label[1]
    
    lines = label.split("\n")
    line_heights = []
    line_widths = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        line_widths.append(w)
        line_heights.append(h + 2)
    
    total_height = sum(line_heights)
    current_y = my - total_height / 2
    
    for i, line in enumerate(lines):
        w = line_widths[i]
        # Draw background dark box for readability
        bx0 = int(mx - w/2 - 4)
        by0 = int(current_y - 2)
        bx1 = int(mx + w/2 + 4)
        by1 = int(current_y + line_heights[i])
        draw.rectangle([bx0, by0, bx1, by1], fill="#121212")
        draw.text((int(mx - w/2), int(current_y)), line, font=font, fill="#E4E4E7")
        current_y += line_heights[i]

# 1. Draw central System Node (Large Circle / Oval)
system_center = (675, 475)
sys_r_x, sys_r_y = 150, 100
draw.ellipse([system_center[0] - sys_r_x, system_center[1] - sys_r_y, 
              system_center[0] + sys_r_x, system_center[1] + sys_r_y], 
             fill="#831843", outline="#F472B6", width=3) # Dark Pink
draw_text_centered(draw, "HỆ THỐNG\nQUẢN LÝ HACKATHON\n(System)", system_center, font_bold, fill="#FDF2F8")

# Define external entities coordinates & box sizes
box_w, box_h = 230, 80

# Entities definition: (name, center_x, center_y, fill, outline, text_color)
entities = {
    "Participant": ("Thí sinh\n(Participant)", 180, 150, "#1E3A8A", "#3B82F6", "#DBEAFE"),  # Top Left 1
    "Judge": ("Giám khảo\n(Judge)", 425, 150, "#312E81", "#6366F1", "#E0E7FF"),            # Top Left 2
    "Organizer": ("Ban tổ chức\n(Organizer)", 675, 150, "#78350F", "#F59E0B", "#FEF3C7"),  # Top Middle
    "Admin": ("Quản trị viên\n(Admin)", 925, 150, "#7F1D1D", "#EF4444", "#FEE2E2"),         # Top Right 2
    "Guest": ("Khách vãng lai\n(Guest / Public)", 1170, 150, "#27272A", "#71717A", "#F4F4F5"), # Top Right 1
    "Mentor": ("Cố vấn\n(Mentor)", 675, 800, "#064E3B", "#10B981", "#D1FAE5"),             # Bottom Middle
}

# Draw entity boxes
for name, data in entities.items():
    label, cx, cy, fill, outline, txt_color = data
    draw_rounded_rect(draw, [cx - box_w/2, cy - box_h/2, cx + box_w/2, cy + box_h/2], 10, fill, outline, width=2)
    draw_text_centered(draw, label, (cx, cy), font_bold, fill=txt_color)

# Helper to calculate intersection points on boundaries
def get_rect_border(cx, cy, target_x, target_y, w, h):
    dx = target_x - cx
    dy = target_y - cy
    if dx == 0:
        return (cx, cy + (h/2 if dy > 0 else -h/2))
    if dy == 0:
        return (cx + (w/2 if dx > 0 else -w/2), cy)
    
    rect_ratio = w / h
    val_ratio = abs(dx / dy)
    if val_ratio > rect_ratio:
        rx = cx + (w/2 if dx > 0 else -w/2)
        ry = cy + (dy * (w/2) / abs(dx))
    else:
        ry = cy + (h/2 if dy > 0 else -h/2)
        rx = cx + (dx * (h/2) / abs(dy))
    return (int(rx), int(ry))

def get_ellipse_border(cx, cy, target_x, target_y, rx, ry):
    dx = target_x - cx
    dy = target_y - cy
    length = (dx**2 + dy**2)**0.5
    if length == 0:
        return (cx, cy)
    theta = (dx / length, dy / length)
    scale = 1.0 / ((theta[0]/rx)**2 + (theta[1]/ry)**2)**0.5
    return (int(cx + theta[0] * scale), int(cy + theta[1] * scale))

# Helper function to calculate angled arrow coordinates and draw flow pairs
def draw_flow_pair(draw, c1, c2, label_in, label_out, font_small, color="#9CA3AF", d=16):
    x1, y1 = c1
    x2, y2 = c2
    dx = x2 - x1
    dy = y2 - y1
    L = (dx**2 + dy**2)**0.5
    if L == 0:
        return
    ux = dx / L
    uy = dy / L
    # Perpendicular vector
    px = -uy
    py = ux
    
    # Calculate boundary points
    p1_in = (x1 + px * d, y1 + py * d)
    p1_out = (x1 - px * d, y1 - py * d)
    p2_in = (x2 + px * d, y2 + py * d)
    p2_out = (x2 - px * d, y2 - py * d)
    
    border1_in = get_rect_border(x1, y1, p2_in[0], p2_in[1], box_w, box_h)
    border1_out = get_rect_border(x1, y1, p2_out[0], p2_out[1], box_w, box_h)
    
    border2_in = get_ellipse_border(x2, y2, p1_in[0], p1_in[1], sys_r_x, sys_r_y)
    border2_out = get_ellipse_border(x2, y2, p1_out[0], p1_out[1], sys_r_x, sys_r_y)
    
    # Add small gaps to offset lines from borders
    start_in = (border1_in[0] + px * 2, border1_in[1] + py * 2)
    end_in = (border2_in[0] + px * 2, border2_in[1] + py * 2)
    
    start_out = (border2_out[0] - px * 2, border2_out[1] - py * 2)
    end_out = (border1_out[0] - px * 2, border1_out[1] - py * 2)
    
    # Calculate middle offsets to move labels perpendicular to lines
    # Adjust shift based on angle to avoid overlapping lines
    label_shift = 32
    if abs(ux) > 0.8: # Horizontal-ish lines
        offset_in = (0, -label_shift)
        offset_out = (0, label_shift)
    else: # Vertical or angled lines
        # Shift along the normal vector
        offset_in = (px * label_shift, py * label_shift)
        offset_out = (-px * label_shift, -py * label_shift)
        
    draw_arrow(draw, start_in, end_in, label_in, font_small, color=color, offset_label=offset_in)
    draw_arrow(draw, start_out, end_out, label_out, font_small, color=color, offset_label=offset_out)

# Draw arrows and data flows using the smart vector calculation

# --- 1. PARTICIPANT <-> SYSTEM ---
draw_flow_pair(draw, (180, 150), system_center,
               "1. Đăng ký & Tạo hồ sơ (UC01)\n2. Đăng ký tham gia Hackathon (UC03)\n3. Tạo/quản lý đội & Mời thành viên (UC04, UC17)\n4. Nộp dự án (UC05)\n5. Gửi yêu cầu cố vấn hỗ trợ (UC06)",
               "1. Thông báo & Lời mời (UC18, UC17)\n2. Điểm số, nhận xét (UC07, UC08)\n3. Kết quả xếp hạng vòng thi (UC16)",
               font_small, color="#9CA3AF")

# --- 2. JUDGE <-> SYSTEM ---
draw_flow_pair(draw, (425, 150), system_center,
               "1. Đăng ký & Tạo hồ sơ (UC01)\n2. Nhập điểm số & Nhận xét bài thi (UC07, UC08)",
               "1. Danh sách bài thi được phân công (UC19)\n2. Bộ tiêu chí chấm điểm (UC21)",
               font_small, color="#9CA3AF")

# --- 3. ORGANIZER <-> SYSTEM ---
draw_flow_pair(draw, (675, 150), system_center,
               "1. Cấu hình cuộc thi/vòng thi (UC09, UC23)\n2. Thiết lập tiêu chí & giải thưởng (UC20, UC21)\n3. Phân công giám khảo & Mentor (UC19, UC22)\n4. Duyệt đội lên vòng tiếp theo (UC15)\n5. Quản lý người dùng & Yêu cầu CSV (UC10, UC14)",
               "1. Báo cáo phân tích thống kê (UC12)\n2. Danh sách & Điểm số dạng CSV (UC14)",
               font_small, color="#9CA3AF")

# --- 4. ADMIN <-> SYSTEM ---
draw_flow_pair(draw, (925, 150), system_center,
               "1. Quản lý vai trò & Phân quyền (UC11)\n2. Quản lý toàn bộ người dùng (UC10)\n3. Quản lý danh mục khách hàng (UC24)\n4. Yêu cầu xem nhật ký hệ thống (UC13)",
               "1. Nhật ký hệ thống Audit log (UC13)\n2. Phản hồi CRUD danh mục khách hàng (UC24)",
               font_small, color="#9CA3AF")

# --- 5. GUEST <-> SYSTEM ---
draw_flow_pair(draw, (1170, 150), system_center,
               "1. Xem danh sách cuộc thi (UC02)\n2. Xem bảng xếp hạng vòng thi (UC16)",
               "1. Thông tin cuộc thi & thể lệ (UC02)\n2. Bảng xếp hạng điểm thời gian thực (UC16)",
               font_small, color="#9CA3AF")

# --- 6. MENTOR <-> SYSTEM ---
draw_flow_pair(draw, (675, 800), system_center,
               "1. Đăng ký & Tạo hồ sơ (UC01)\n2. Viết phản hồi/Nhận xét hỗ trợ (UC08)",
               "1. Danh sách yêu cầu hỗ trợ (UC06)\n2. Thông tin Track & đề tài phân công (UC22)",
               font_small, color="#9CA3AF")

# Ensure output directory exists
os.makedirs("d:\\Intellji\\SWP391-Project\\documentation", exist_ok=True)

# Save image
output_path = "d:\\Intellji\\SWP391-Project\\documentation\\context_diagram.png"
image.save(output_path, "PNG")
print(f"Successfully saved context diagram to {output_path}")
