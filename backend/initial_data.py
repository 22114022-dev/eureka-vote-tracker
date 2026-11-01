"""
Euréka 2026 - Khoa học Nông nghiệp (KHNN) Initial Dataset
Total 63 projects across 3 pages (21 per page approx).
Target project: KHNN2026-002
"""

SEED_PROJECTS = [
    {
        "rank": 1,
        "code": "KHNN2026-002",
        "title": "Ứng dụng AI trong chẩn đoán bệnh hại cây con trong giai đoạn vườn ươm",
        "authors": "Phạm Nguyễn Nhật Thành; Lê Tuấn Anh",
        "votes": 1444,
        "page": 1,
        "isTarget": True
    },
    {
        "rank": 2,
        "code": "KHNN2026-054",
        "title": "Phân tích các chất chuyển hóa của Sâm cau Curculigo orchioides Gaertn theo các vùng canh tác ở Việt Nam và biến đổi các chất sinh học trong củ Sâm cau đen dựa trên phương pháp tiếp cận Untargeted Metabolomics",
        "authors": "Nguyễn Văn Bửu; Phạm Thành Nhân",
        "votes": 1417,
        "page": 3,
        "isTarget": False
    },
    {
        "rank": 3,
        "code": "KHNN2026-039",
        "title": "Nghiên cứu quá trình vi bao astaxanthin từ vỏ tôm và bước đầu ứng dụng chế phẩm astaxanthin trong thực phẩm",
        "authors": "Lê Văn Hiếu; Trương Công Nhật Tùng; Huỳnh Đặng Quỳnh Trâm; Trần Thùy Phúc",
        "votes": 1163,
        "page": 2,
        "isTarget": False
    },
    {
        "rank": 4,
        "code": "KHNN2026-019",
        "title": "Xây dựng bản đồ mẫn cảm IgE đặc hiệu với 64 dị nguyên ở chó nghi viêm da dị ứng tại Hà Nội",
        "authors": "Đào Vũ Thanh Mai; Hà Anh; Nguyễn Tất Đạt; Nguyễn Khánh Ly; Ngô Phương Anh",
        "votes": 1118,
        "page": 1,
        "isTarget": False
    },
    {
        "rank": 5,
        "code": "KHNN2026-051",
        "title": "Ứng dụng multiplex PCR phát hiện nhanh và đồng thời các loài tảo lam (Cyanobacteria) tại khu vực Rừng Sác, Cần Giờ, Thành phố Hồ Chí Minh",
        "authors": "Nguyễn Hương Giang; Cao Ngọc Lê Huy; Huỳnh Ngọc Băng; Nguyễn Thành Phát; Hồ Đặng Minh Trâm",
        "votes": 767,
        "page": 3,
        "isTarget": False
    },
    {
        "rank": 6,
        "code": "KHNN2026-058",
        "title": "Phân lập, tuyển chọn một số chủng Bacillus sp. có hoạt tính sinh học và đánh giá ảnh hưởng đến sinh trưởng cây cà chua",
        "authors": "Nhóm tác giả KHNN2026-058",
        "votes": 620,
        "page": 3,
        "isTarget": False
    },
    {
        "rank": 7,
        "code": "KHNN2026-052",
        "title": "Nghiên cứu khả năng tận dụng cám lúa mì làm môi trường nuôi cấy Bacillus megaterium",
        "authors": "Nhóm tác giả KHNN2026-052",
        "votes": 600,
        "page": 3,
        "isTarget": False
    },
    {
        "rank": 8,
        "code": "KHNN2026-016",
        "title": "Tuyển chọn vi sinh vật đa chức năng đối kháng nấm bệnh và đánh giá khả năng lên men phụ phẩm cá định hướng ứng dụng trong canh tác sầu riêng",
        "authors": "Đinh Thị Thảo Linh; Võ Thanh Hương; Nguyễn Trần Tường Vy; Nguyễn Bảo Nghi",
        "votes": 557,
        "page": 1,
        "isTarget": False
    }
]

# Additional 55 projects to complete the full 63 projects across 3 pages
ADDITIONAL_PROJECTS = [
    # PAGE 1 (Projects 001 - 021)
    {"code": "KHNN2026-001", "title": "Nghiên cứu ứng dụng chế phẩm sinh học từ nấm Trichoderma phòng trừ bệnh vàng lá trên cây cam", "authors": "Nguyễn Hoàng Nam; Vũ Thị Hoa", "votes": 532, "page": 1},
    {"code": "KHNN2026-003", "title": "Khảo sát tính kháng sâu tơ Plutella xylostella trên các giống rau cải ăn lá tại Lâm Đồng", "authors": "Trần Minh Quân; Đỗ Thúy Vy", "votes": 510, "page": 1},
    {"code": "KHNN2026-004", "title": "Đánh giá chất lượng nước ao nuôi cá tra thâm canh ứng dụng công nghệ Biofloc tại An Giang", "authors": "Lâm Quốc Trọng; Bùi Ánh Dương", "votes": 495, "page": 1},
    {"code": "KHNN2026-005", "title": "Ứng dụng màng nano chitosan kết hợp tinh dầu bạc hà kéo dài thời gian bảo quản xoài cát Hòa Lộc", "authors": "Hoàng Kim Chi; Phạm Văn Đức", "votes": 480, "page": 1},
    {"code": "KHNN2026-006", "title": "Nghiên cứu đặc tính di truyền và nhân giống in vitro cây sâm Bố Chính (Abelmoschus sagittifolius)", "authors": "Võ Hồng Sơn; Đặng Thu Trang", "votes": 465, "page": 1},
    {"code": "KHNN2026-007", "title": "Tối ưu hóa quy trình trích ly pectin từ phế phụ phẩm vỏ thanh long Bình Thuận", "authors": "Nguyễn Mai Phương; Trần Đăng Khoa", "votes": 450, "page": 1},
    {"code": "KHNN2026-008", "title": "Đánh giá tiềm năng sử dụng bột lá chùm ngây làm thức ăn bổ sung cho gà thịt thả vườn", "authors": "Lê Quang Khải; Trịnh Bích Ngọc", "votes": 435, "page": 1},
    {"code": "KHNN2026-009", "title": "Nghiên cứu giải pháp tưới nhỏ giọt kết hợp IoT cho cây bưởi da xanh vùng hạn mặn Bến Tre", "authors": "Dương Quốc Bảo; Nguyễn Hải Yến", "votes": 420, "page": 1},
    {"code": "KHNN2026-010", "title": "Sản xuất than sinh học (biochar) từ rơm rạ cải tạo đất phèn Đồng bằng sông Cửu Long", "authors": "Phan Hữu Nghĩa; Mai Thị Hồng", "votes": 405, "page": 1},
    {"code": "KHNN2026-011", "title": "Khảo nghiệm các giống bắp lai chịu hạn ngắn ngày tại vùng duyên hải Nam Trung Bộ", "authors": "Trần Văn Tùng; Lê Như Quỳnh", "votes": 390, "page": 1},
    {"code": "KHNN2026-012", "title": "Ứng dụng ảnh viễn thám và chỉ số NDVI trong dự báo năng suất lúa tại Kiên Giang", "authors": "Hồ Bảo Long; Vũ Minh Châu", "votes": 380, "page": 1},
    {"code": "KHNN2026-013", "title": "Tách chiết và xác định hoạt tính kháng khuẩn của tinh dầu sả chanh đối với vi khuẩn gây bệnh trên ếch", "authors": "Bùi Đức Thịnh; Nguyễn Thị Trà", "votes": 365, "page": 1},
    {"code": "KHNN2026-014", "title": "Ảnh hưởng của mật độ thả nuôi đến tăng trưởng và tỷ lệ sống của ốc bươu đen", "authors": "Nguyễn Tuấn Kiệt; Đinh Hồng Nhung", "votes": 350, "page": 1},
    {"code": "KHNN2026-015", "title": "Nghiên cứu tạo màng bao sinh học tự phân hủy từ tinh bột bắp biến tính", "authors": "Đoàn Gia Huy; Tăng Mỹ Duyên", "votes": 338, "page": 1},
    {"code": "KHNN2026-017", "title": "Nghiên cứu đa dạng nấm cộng sinh rễ Arbuscular Mycorrhizal trên đất trồng cà phê Đắk Lắk", "authors": "Trần Thị Tuyết; Mai Văn Hưng", "votes": 325, "page": 1},
    {"code": "KHNN2026-018", "title": "Tận dụng bã mía làm giá thể trồng nấm bào ngư xám đạt tiêu chuẩn hữu cơ", "authors": "Phạm Gia Hân; Nguyễn Đình Triết", "votes": 310, "page": 1},
    {"code": "KHNN2026-020", "title": "Đánh giá khả năng hấp thụ kim loại nặng của cỏ vetiver trong xử lý nước thải chăn nuôi lợn", "authors": "Vũ Đình Phong; Lê Thị Thảo", "votes": 298, "page": 1},
    {"code": "KHNN2026-021", "title": "Nghiên cứu quy trình lên men vang thanh long ruột đỏ sử dụng chủng Saccharomyces cerevisiae bản địa", "authors": "Ngô Quang Vinh; Chu Thị Thu", "votes": 285, "page": 1},

    # PAGE 2 (Projects 022 - 042)
    {"code": "KHNN2026-022", "title": "Đánh giá hiệu quả của hệ thống Aquaponics quy mô nông hộ trồng rau xà lách và nuôi cá điêu hồng", "authors": "Lê Văn Đạt; Nguyễn Thị Bích", "votes": 272, "page": 2},
    {"code": "KHNN2026-023", "title": "Khảo sát hàm lượng hoạt chất cordycepin trong đông trùng hạ thảo nuôi trồng trên cơ chất gạo lứt", "authors": "Trần Hữu Thắng; Đoàn Thị Mai", "votes": 260, "page": 2},
    {"code": "KHNN2026-024", "title": "Nghiên cứu phát triển thức ăn hỗn hợp lên men cho bò sữa từ phế phụ phẩm công nghiệp dứa", "authors": "Nguyễn Thanh Tùng; Hà Thảo My", "votes": 250, "page": 2},
    {"code": "KHNN2026-025", "title": "Ứng dụng enzym cellulase thương mại trong tiền xử lý rơm rạ sản xuất ethanol sinh học", "authors": "Phan Minh Trí; Vũ Khánh Linh", "votes": 240, "page": 2},
    {"code": "KHNN2026-026", "title": "Tuyển chọn giống dưa lưới chịu nhiệt trồng trong nhà màng vụ hè thu tại Bình Dương", "authors": "Đỗ Hoàng Long; Trịnh Thị Hương", "votes": 230, "page": 2},
    {"code": "KHNN2026-027", "title": "Nghiên cứu tỷ lệ phối trộn xơ dừa và trấu hun làm giá thể ươm cây lâm nghiệp", "authors": "Nguyễn Văn Hậu; Đinh Thị Thảo", "votes": 220, "page": 2},
    {"code": "KHNN2026-028", "title": "Xác định thành phần loài sâu đục thân lúa và biến động mật độ quần thể tại Trà Vinh", "authors": "Bùi Thế Anh; Lê Thúy Hằng", "votes": 210, "page": 2},
    {"code": "KHNN2026-029", "title": "Sản xuất phân bón hữu cơ nano từ xương cá tra phụ phẩm ngành chế biến thủy sản", "authors": "Võ Minh Thông; Đặng Quỳnh Nga", "votes": 200, "page": 2},
    {"code": "KHNN2026-030", "title": "Khảo sát hoạt tính chống oxy hóa của cao chiết lá sen non sấy thăng hoa", "authors": "Trần Thị Diệu; Nguyễn Văn Phúc", "votes": 192, "page": 2},
    {"code": "KHNN2026-031", "title": "Nghiên cứu ảnh hưởng của đèn LED chiếu sáng nhân tạo đến sinh trưởng rau mầm củ cải trắng", "authors": "Lâm Hoài An; Hoàng Thu Thảo", "votes": 185, "page": 2},
    {"code": "KHNN2026-032", "title": "Thử nghiệm vaccin keo phèn phòng bệnh lở mồm long móng trên lợn thịt", "authors": "Dương Minh Hưng; Phạm Thị Loan", "votes": 178, "page": 2},
    {"code": "KHNN2026-033", "title": "Nghiên cứu kỹ thuật nhân giống giâm hom cây cà gai leo (Solanum procumbens)", "authors": "Hồ Văn Cường; Chu Diễm Hương", "votes": 170, "page": 2},
    {"code": "KHNN2026-034", "title": "Đánh giá hiệu quả mô hình nuôi tôm sú kết hợp trồng rừng ngập mặn tại Cà Mau", "authors": "Nguyễn Hoàng Việt; Vũ Quỳnh Trang", "votes": 164, "page": 2},
    {"code": "KHNN2026-035", "title": "Khảo sát chất lượng mật ong hoa bạc hà tại cao nguyên đá Đồng Văn - Hà Giang", "authors": "Tạ Quang Dũng; Đinh Diệu Linh", "votes": 158, "page": 2},
    {"code": "KHNN2026-036", "title": "Nghiên cứu chế tạo màng hydrogel từ phụ phẩm dịch ép thân chuối giữ ẩm cho đất cát", "authors": "Lê Phước Lộc; Trần Kim Ngân", "votes": 152, "page": 2},
    {"code": "KHNN2026-037", "title": "Sàng lọc chủng nấm men chịu mặn ứng dụng lên men nước mắm truyền thống Phú Quốc", "authors": "Vũ Văn Quyết; Mai Kim Oanh", "votes": 145, "page": 2},
    {"code": "KHNN2026-038", "title": "Ứng dụng ảnh nhiệt drone phát hiện sớm sâu đục thân trên cây điều", "authors": "Nguyễn Trọng Đại; Lê Kiều Oanh", "votes": 140, "page": 2},
    {"code": "KHNN2026-040", "title": "Tách chiết polyphenol từ lá ổi sẻ và đánh giá khả năng ức chế vi khuẩn Edwardsiella ictaluri", "authors": "Đỗ Minh Quân; Nguyễn Ngọc Lan", "votes": 135, "page": 2},
    {"code": "KHNN2026-041", "title": "Khảo sát chất lượng sữa tươi nguyên liệu và vệ sinh an toàn thực phẩm tại trang trại Củ Chi", "authors": "Bùi Văn Thành; Trần Ánh Tuyết", "votes": 130, "page": 2},
    {"code": "KHNN2026-042", "title": "Nghiên cứu phối chế trà thảo mộc hòa tan từ hoa cúc kim cương và hoa actiso", "authors": "Lê Thị Cẩm Vân; Phan Quốc Đạt", "votes": 125, "page": 2},

    # PAGE 3 (Projects 043 - 063)
    {"code": "KHNN2026-043", "title": "Khảo nghiệm tính thích ứng của cây chùm ngây trồng trên vùng đất cát ven biển Quảng Trị", "authors": "Nguyễn Duy Hưng; Tống Thị Huyền", "votes": 120, "page": 3},
    {"code": "KHNN2026-044", "title": "Nghiên cứu phương pháp ức chế mọc mầm củ khoai tây bằng tinh dầu thảo mộc thiên nhiên", "authors": "Trịnh Quốc Huy; Vũ Minh Tâm", "votes": 115, "page": 3},
    {"code": "KHNN2026-045", "title": "Đánh giá tác động của thuốc diệt cỏ glyphosate đối với quần thể vi sinh vật chỉ thị trong đất", "authors": "Đoàn Văn Bằng; Lê Thị Nhã", "votes": 110, "page": 3},
    {"code": "KHNN2026-046", "title": "Ứng dụng công nghệ sấy sấy tháp động đối với hạt tiêu đen Gia Lai nhằm bảo tồn hàm lượng piperine", "authors": "Võ Quốc Cường; Hoàng Mỹ Lệ", "votes": 105, "page": 3},
    {"code": "KHNN2026-047", "title": "Xây dựng mô hình chuỗi cung ứng ngắn cho bưởi Phúc Trạch hướng tới phát triển bền vững", "authors": "Phạm Hải Đăng; Đặng Kim Chi", "votes": 100, "page": 3},
    {"code": "KHNN2026-048", "title": "Tuyển chọn giống ớt cay chỉ thiên kháng virus xoăn lá phục vụ xuất khẩu", "authors": "Lê Văn Tám; Nguyễn Ngọc Bích", "votes": 96, "page": 3},
    {"code": "KHNN2026-049", "title": "Nghiên cứu quy trình ép đùn sản xuất thức ăn viên nổi cho cá lăng nha", "authors": "Trần Đình Trọng; Lâm Thị Thắm", "votes": 92, "page": 3},
    {"code": "KHNN2026-050", "title": "Khảo sát tình trạng ký sinh trùng đường ruột trên bò sữa nuôi tại huyện Mộc Châu", "authors": "Hồ Sĩ Hùng; Nguyễn Thị Hà", "votes": 88, "page": 3},
    {"code": "KHNN2026-053", "title": "Xử lý bã cà phê làm nguyên liệu sản xuất viên nén sinh học đốt công nghiệp", "authors": "Dương Thái Hòa; Phạm Lan Anh", "votes": 84, "page": 3},
    {"code": "KHNN2026-055", "title": "Nghiên cứu nhân dòng và biểu hiện gen mã hóa enzyme chitinase đối kháng nấm bệnh thực vật", "authors": "Lê Hoàng Phúc; Mai Trúc Linh", "votes": 80, "page": 3},
    {"code": "KHNN2026-056", "title": "Ứng dụng ảnh quang phổ đa bước sóng đánh giá độ ẩm đất tại vườn cao su Bình Phước", "authors": "Nguyễn Đăng Quang; Vũ Thảo Vy", "votes": 76, "page": 3},
    {"code": "KHNN2026-057", "title": "Tách chiết chất màu tự nhiên anthocyanin từ quả mâm xôi phục vụ công nghiệp chế biến sữa", "authors": "Hoàng Quốc Việt; Đinh Mai Khanh", "votes": 72, "page": 3},
    {"code": "KHNN2026-059", "title": "Khảo nghiệm các dòng lúa thuần chất lượng cao thích nghi với thổ nhưỡng đất đồi dốc Tây Bắc", "authors": "Bùi Văn Kiên; Trần Ngọc Anh", "votes": 68, "page": 3},
    {"code": "KHNN2026-060", "title": "Nghiên cứu bào chế gel bôi ngoài da chứa nano bạc và cao hoàng liên điều trị nấm da cho thú cưng", "authors": "Võ Thị Quỳnh Như; Lê Đình Nam", "votes": 64, "page": 3},
    {"code": "KHNN2026-061", "title": "Đánh giá chất lượng nước ngầm phục vụ tưới tiêu tại vùng trồng hoa Sa Đéc - Đồng Tháp", "authors": "Nguyễn Minh Thuận; Đặng Thị Mai", "votes": 60, "page": 3},
    {"code": "KHNN2026-062", "title": "Nghiên cứu tạo thức ăn tự nhiên luân trùng (Rotifera) phục vụ sản xuất giống cá biển", "authors": "Phan Hữu Lộc; Trương Bích Trâm", "votes": 56, "page": 3},
    {"code": "KHNN2026-063", "title": "Khảo sát và bảo tồn nguồn gen các giống nếp bản địa quý tại tỉnh Điện Biên", "authors": "Trần Văn Cảnh; Lê Mỹ Duyên", "votes": 52, "page": 3}
]

def get_initial_dataset():
    """Return all 63 projects sorted by votes descending, with correct rank and isTarget."""
    all_projects = []
    # Seed top 8 projects
    for p in SEED_PROJECTS:
        all_projects.append(dict(p))
    
    # Additional projects
    for p in ADDITIONAL_PROJECTS:
        item = dict(p)
        item["isTarget"] = (item["code"] == "KHNN2026-002")
        all_projects.append(item)
    
    # Sort descending by votes
    all_projects.sort(key=lambda x: x["votes"], reverse=True)
    
    # Re-assign ranks 1..63
    for i, proj in enumerate(all_projects, start=1):
        proj["rank"] = i
        proj["diffTop1"] = all_projects[0]["votes"] - proj["votes"]
        proj["changeLastCycle"] = 0
    
    return all_projects

if __name__ == "__main__":
    data = get_initial_dataset()
    print(f"Total projects loaded: {len(data)}")
    print(f"Target: {[p for p in data if p['isTarget']][0]}")
    page1 = [p for p in data if p["page"] == 1]
    page2 = [p for p in data if p["page"] == 2]
    page3 = [p for p in data if p["page"] == 3]
    print(f"Page 1: {len(page1)}, Page 2: {len(page2)}, Page 3: {len(page3)}")
