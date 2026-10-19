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

1. Nhập **tổng số ký tự** (1–60), không tính khoảng trắng, ví dụ “học sinh” là 7. Có thể nhập thêm **Số ký tự tiếng thứ nhất** (không bắt buộc, phải nhỏ hơn tổng), rồi nhấn **Tìm từ**. Để trống ô này để tìm mọi cách chia; ví dụ tổng 7 và tiếng thứ nhất 3 chỉ tìm các từ dạng 3 + 4.
2. Điền chữ đã biết vào dãy ô vị trí liên tiếp, bỏ qua khoảng trắng; để trống các ô chưa biết. Kết quả lọc tức thì, ký tự khớp được tô nền.
3. Dùng Tab hoặc ← → để chuyển ô. Có thể dán cả từ vào các ô liên tiếp; khoảng trắng sẽ được bỏ qua.
4. Bật **Bỏ qua dấu tiếng Việt** nếu chỉ biết chữ cái cơ bản; mặc định khớp chính xác dấu và luôn không phân biệt hoa/thường.
5. Trong card **Loại dần theo ký tự**, nhập **Ký tự đã đúng** để giữ từ chứa đủ các chữ đã biết (ở bất kỳ vị trí nào trong hai tiếng). Nhập **Ký tự đã sai** để loại từ chứa một trong các chữ đó. Ví dụ: `h, c, n` và `b, đ, m`. Chữ lặp chỉ xét một lần, không yêu cầu số lần xuất hiện.
6. Hai card lọc kết hợp tức thì và cùng dùng tùy chọn bỏ dấu. Nếu chữ vừa phải có vừa bị loại, trang sẽ báo mâu thuẫn.
7. **Xóa vị trí** chỉ xóa các ô vị trí; **Xóa bộ lọc** chỉ xóa hai nhóm ký tự. Đổi độ dài và tìm lại sẽ bắt đầu lượt mới, xóa cả hai nhóm gợi ý.

Ứng dụng lập chỉ mục theo tổng `count_1 + count_2`, chuẩn hóa Unicode tiếng Việt, gộp từ trùng và bỏ dòng không có đúng hai tiếng/tổng độ dài tương ứng khi hiển thị. Các từ còn lại đều khớp gợi ý; không có xếp hạng xác suất vì dữ liệu chưa có tần suất sử dụng. Danh sách hiển thị 120 từ mỗi lượt; bộ lọc luôn xét toàn bộ kết quả cùng độ dài.

Một tổng độ dài có thể khớp nhiều cách chia hai tiếng (ví dụ 7 = 3 + 4 hoặc 4 + 3). Kết quả vẫn hiển thị khoảng trắng gốc, còn các ô vị trí được đánh số liên tục từ 1 đến tổng số ký tự.

## Game đoán chữ

Mở `game.html` cùng thư mục với `words-data.js`. Game chạy bằng HTML/JavaScript, chơi được offline, chọn ngẫu nhiên từ có ít nhất 7 ký tự (không tính khoảng trắng). Mỗi từ có tối đa 6 lượt; có thể nhập có hoặc không có khoảng trắng, không phân biệt hoa/thường. Lượt nhập thiếu/thừa ký tự, ký hiệu không hợp lệ hoặc trùng lần đoán trước không bị tính lượt. Không bắt buộc câu trả lời thuộc từ điển, để có thể thử các dấu.

- **Xanh lá:** đúng chữ, đúng dấu và đúng vị trí.
- **Xanh dương:** cùng chữ gốc tại đúng vị trí, khác dấu/mũ; `d` và `đ` cùng chữ gốc.
- **Vàng:** đúng chữ và dấu nhưng sai vị trí.
- **Xám:** không có chữ khớp còn lại trong đáp án.

Chấm ô xanh lá trước, rồi xanh dương, rồi vàng. Mỗi vị trí đáp án chỉ được dùng một lần khi chấm, kể cả chữ lặp. Thắng khi khớp toàn bộ chữ và dấu. Hết 6 lượt sai sẽ hiện đáp án; sau khi kết thúc có thể chọn từ mới.

Dữ liệu lưu tại khóa localStorage `go-chu-game-v1`: ván hiện tại (kể cả phần đang gõ), danh sách đáp án đã chọn và lịch sử hoàn thành. Tải lại trang sẽ tiếp tục ván hiện tại. Từ đã chọn không được chọn lại, kể cả ván thua. Khi hết từ, game dừng chọn từ mới và giữ lịch sử. Bảng điểm tính trên các ván hoàn thành: số ván, số thắng, tỉ lệ thắng và số ván thắng liên tiếp hiện tại; thua sẽ đưa chuỗi về 0.

Lịch sử thuộc trình duyệt/địa chỉ mở trang hiện tại; xóa dữ liệu trình duyệt hoặc đổi trình duyệt/địa chỉ sẽ không giữ lịch sử cũ. Khi localStorage không khả dụng, game báo rõ và chỉ giữ tiến độ trong phiên đang mở.

Bàn phím ảo dưới ô đoán gồm QWERTY, các chữ `ă â ê ô ơ ư đ`, phím dấu thanh, dấu cách, xóa và Enter. Phím dấu áp dụng cho nguyên âm được chọn hoặc nguyên âm gần nhất trước con trỏ trong tiếng đang gõ. Màu phím tổng hợp các lượt đã thử, ưu tiên xanh lá > xanh dương > vàng > xám; màu chỉ áp dụng cho đúng ký tự trên phím. Ván mới xóa màu, tải lại trang khôi phục màu từ lịch sử lượt đoán.
