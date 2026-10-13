# Gỡ chữ

Tool tìm từ gồm hai tiếng, chạy bằng HTML và JavaScript thuần.

Tác giả: **Hisu** + Codex

## Mở ứng dụng

Mở trực tiếp `index.html` bằng trình duyệt. Giữ các file sau trong cùng thư mục:

- `index.html`: giao diện.
- `app.js`: tra cứu và lọc ký tự.
- `words-data.js`: dữ liệu JSON được gán vào `window.WORDS_DATA`.
- `style.css`: định dạng giao diện.

Cũng có thể đưa cả bốn file lên hosting tĩnh. Dữ liệu được nạp bằng thẻ script, không dùng fetch/API nên hoạt động cả khi mở bằng `file://`.

## Dữ liệu

`words-data.js` chứa bản sao 52.403 dòng được xuất ngày 13/10/2026, giữ ba cột `text`, `count_1`, `count_2`:

```js
window.WORDS_DATA = {"words":[
    {"text":"học sinh","count_1":3,"count_2":4}
]};
```

Đây là dữ liệu tĩnh. Để cập nhật, thay file `words-data.js` bằng bản xuất mới cùng cấu trúc rồi tải lại trang.

## Sử dụng

1. Nhập số ký tự của hai tiếng (1–30), nhấn **Tìm từ**.
2. Điền chữ đã biết vào đúng vị trí; để trống các ô chưa biết. Kết quả lọc tức thì, ký tự khớp được tô nền.
3. Dùng Tab hoặc ← → để chuyển ô. Có thể dán một tiếng vào các ô liên tiếp trong cùng tiếng.
4. Bật **Bỏ qua dấu tiếng Việt** nếu chỉ biết chữ cái cơ bản; mặc định khớp chính xác dấu và luôn không phân biệt hoa/thường.
5. Nhấn **Xóa ký tự** để xem lại toàn bộ danh sách theo độ dài.

Ứng dụng lập chỉ mục theo `count_1`, `count_2`, chuẩn hóa Unicode tiếng Việt, gộp từ trùng và bỏ dòng không có đúng hai tiếng/độ dài tương ứng khi hiển thị. Các từ còn lại đều khớp gợi ý; không có xếp hạng xác suất vì dữ liệu chưa có tần suất sử dụng. Danh sách hiển thị 120 từ mỗi lượt; bộ lọc luôn xét toàn bộ kết quả cùng độ dài.
