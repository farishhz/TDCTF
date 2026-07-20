# F3 - Service & Multi Questions
## Description
> Selamat datang di TDCTF!

Challenge ini dibuat untuk memperkenalkan beberapa fitur utama yang tersedia di platform **TDCTF**, seperti **Machines**, **TDCTL Services**, dan **Multi Questions**.

### 🚀 Cara Memulai

1. Klik tombol **Start** pada machine di bawah ini.
2. Tunggu hingga status machine berubah menjadi **Running**.
3. Setelah machine aktif, bagian **TDCTL Services** akan menampilkan seluruh informasi koneksi yang dibutuhkan.

> 💡 Challenge ini menggunakan **Shared Instance**. Jika machine sudah dijalankan oleh peserta lain, kamu **tidak perlu menekan tombol Start maupun Restart**. Cukup gunakan informasi koneksi yang telah tersedia.

### 📡 Mengenal TDCTL Services
Pada challenge ini kamu akan menemukan beberapa service berikut:
- **Bastion** → Server SSH yang digunakan sebagai pintu masuk ke jaringan lab.
- **Lab / Target** → Machine yang menjadi target challenge.
- **Services** → Daftar service yang tersedia pada target.

### Multi Questions
- **Multi Questions** → Satu challenge dapat memiliki lebih dari satu pertanyaan sebelum challenge dinyatakan selesai.
- **Question #1** → Flag yang didapatkan ketika pertama kali mengakses Bastion.
- **Question #2** → Flag yang didapatkan ketika mengakses web pada target internal

### 🔐 Mengakses Bastion
Pada bagian **Bastion**, TDCTL akan menyediakan command SSH yang siap digunakan.

Contoh:
```bash
ssh lab@43.154.191.113 -p 38155
```

Cukup tekan tombol **Copy**, buka terminal, lalu **paste** command tersebut.

Saat pertama kali menjalankan command tersebut, TDCTL akan membuat akun lab sementara dan menampilkan **username** serta **password** yang telah digenerate.

Gunakan credential tersebut untuk login kembali ke Bastion menggunakan host yang sama.

> 💡 Setelah berhasil login, akan muncul **Bastion Flag**. Gunakan flag tersebut untuk menjawab **Question #1**.

### 🌐 Mengakses Service Internal
Misalkan target challenge berada pada alamat berikut:
```
10.10.10.11:80
```

> Karena target hanya dapat diakses dari jaringan internal, gunakan **SSH Local Port Forwarding** pada terminal baru menggunakan user baru yang tadi telah didapatkan saat login pertama kali.

Contoh:
```bash
ssh -L 8080:10.10.10.11:80 [username_kamu]@43.154.191.113 -p 38155
```

Kemudian akses melalui browser di laptop kamu:
```
http://127.0.0.1:8080
```

Sebagai alternatif, kamu juga dapat menggunakan tools yang tersedia di Bastion, seperti **curl**, untuk mengakses service internal secara langsung dari terminal Bastion.

> 💡 Setelah menemukan flag pada web target, gunakan flag tersebut untuk menjawab **Question #2**.

> Challenge ini hanya bertujuan untuk memperkenalkan cara kerja lab di TDCTF. Tidak diperlukan eksploitasi yang kompleks. Fokuslah memahami cara menggunakan **TDCTL Services**, mengakses **Bastion**, serta berinteraksi dengan service yang berada di jaringan internal.

## Attachment
### Files
- (No files)

### Url
- (No links)

## Solution
-

## Flag
- Question #1: TDCTF{R3dy_t0_B0oT_T0_Ro0T_L4b5?}
- Question #2: TDCTF{y0u_h4v3_p3n3tr4t3d_th3_1nt3rn4l_n3tw0rk}
