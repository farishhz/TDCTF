'use client'

import React from 'react'
import { AdminDataSurface } from '@/features/admin/ui'
import {
  BookOpen,
  Calendar,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
  Award,
  AlertTriangle,
  ArrowRight,
  Info,
  Key,
  Shield,
  Users
} from 'lucide-react'

export default function EventGuideCard() {
  return (
    <AdminDataSurface className="h-[calc(100dvh-8.5rem)] min-h-[520px]" contentClassName="flex h-full min-h-0 flex-col p-6 overflow-y-auto">
      <div className="max-w-4xl space-y-8 pb-12">
        
        {/* Header */}
        <div className="space-y-2 border-b border-gray-200/60 pb-5 dark:border-gray-800/60">
          <div className="flex items-center gap-2 text-blue-500">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider">Dokumentasi System</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
            Panduan Lengkap: Team Event, Roster Lock, & Unique Token
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Panduan resmi administrasi dan pengerjaan kompetisi berbasis tim (kelompok) pada platform TDCTF.
          </p>
        </div>

        {/* Tahap 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black uppercase text-gray-900 dark:text-white">
              Langkah 1: Setup Event Baru (Admin)
            </h3>
          </div>
          <div className="pl-10 space-y-2.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            <p>
              Untuk mengonfigurasi event agar berjalan dalam mode Tim:
            </p>
            <ul className="list-decimal pl-4 space-y-1.5 list-outside">
              <li>Masuk ke menu utama <strong className="text-gray-900 dark:text-white">Events</strong> di panel admin, lalu klik <strong className="text-gray-900 dark:text-white">+ Add Event</strong> atau <strong className="text-gray-900 dark:text-white">Edit</strong>.</li>
              <li>Pada bagian <strong className="text-gray-900 dark:text-white">Access</strong>, aktifkan switch <strong className="text-gray-900 dark:text-white">Event Per Team</strong>.</li>
              <li>Pilih opsi <strong className="text-gray-900 dark:text-white">Join Mode</strong> yang sesuai:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                  <li><strong className="text-gray-900 dark:text-white">Open</strong>: Tim langsung bergabung secara instan begitu kapten menekan join.</li>
                  <li><strong className="text-gray-900 dark:text-white">Request</strong>: Butuh persetujuan manual Admin di tab *Members*.</li>
                  <li><strong className="text-gray-900 dark:text-white">Key</strong>: Tim wajib memasukkan token registrasi unik yang di-generate khusus per-tim.</li>
                </ul>
              </li>
              <li>Tentukan batas maksimal anggota per-tim pada input <strong className="text-gray-900 dark:text-white">Max Team Members</strong> (Roster Limit). Kosongkan jika tanpa batasan.</li>
              <li>Pada bagian <strong className="text-gray-900 dark:text-white">Schedule</strong>, tentukan batas waktu pengumpulan pada kolom <strong className="text-gray-900 dark:text-white">Write-Up Deadline</strong>. Kosongkan jika event tidak membutuhkan pengumpulan laporan write-up.</li>
            </ul>
          </div>
        </section>

        {/* Tahap 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Key className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black uppercase text-gray-900 dark:text-white">
              Langkah 2: Pembuatan Token Registrasi Tim (Admin)
            </h3>
          </div>
          <div className="pl-10 space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            <p>
              Apabila Join Mode diatur ke **Key**, Admin harus membuat token unik untuk masing-masing tim resmi:
            </p>
            <ul className="list-decimal pl-4 space-y-1.5 list-outside">
              <li>Pindah ke tab <strong className="text-gray-900 dark:text-white">Members / Teams</strong> di panel admin.</li>
              <li>Pilih event yang dimaksud dari dropdown pilihan event di bagian kiri atas.</li>
              <li>Klik sub-tab <strong className="text-gray-900 dark:text-white">Team Registrations</strong>.</li>
              <li>Klik tombol <strong className="text-blue-500">+ Generate Team Token</strong> di sudut kanan atas.</li>
              <li>Pilih nama tim resmi dari dropdown menu, lalu klik <strong className="text-blue-500">Generate Token</strong>.</li>
              <li>Sistem akan secara otomatis membuat token registrasi berformat <strong className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-blue-500">CTF-TEAM-XXXX-XXXX</strong> yang terikat eksklusif ke tim tersebut.</li>
            </ul>
          </div>
        </section>

        {/* Tahap 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black uppercase text-gray-900 dark:text-white">
              Langkah 3: Registrasi Event & Roster Locking (Kapten Tim)
            </h3>
          </div>
          <div className="pl-10 space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            <p>
              Kapten tim melakukan klaim token dan pendaftaran melalui langkah berikut:
            </p>
            <ul className="list-decimal pl-4 space-y-1.5 list-outside">
              <li>Kapten Tim login dan membuka menu <strong className="text-gray-900 dark:text-white">Team</strong> pada navigasi utama, lalu masuk ke tab <strong className="text-gray-900 dark:text-white">Manage</strong>.</li>
              <li>Pada kartu <strong className="text-gray-900 dark:text-white">Event Registration Tokens</strong>, Kapten dapat melihat dan menyalin token unik yang telah dibuat oleh Admin. *(Hanya Kapten yang dapat melihat kartu ini).*</li>
              <li>Kapten mengunjungi halaman <strong className="text-gray-900 dark:text-white">Join Event</strong> pada website.</li>
              <li>Tempelkan token registrasi tersebut ke dalam input field dan klik tombol <strong className="text-gray-900 dark:text-white">Daftarkan Tim</strong>.</li>
              <li>
                <strong className="text-gray-900 dark:text-white">Validasi Batas Roster & Roster Lock (Anti-Cheat)</strong>:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-gray-500">
                  <li>Pendaftaran otomatis ditolak jika anggota tim melebihi batas <strong className="text-red-400">Max Team Members</strong>.</li>
                  <li>Saat registrasi sukses, daftar anggota tim saat itu juga diambil snapshot-nya dan dikunci ke database.</li>
                  <li>Anggota baru yang bergabung ke tim *setelah* pendaftaran selesai tidak akan bisa mengakses tantangan (Roster Locked) guna mencegah pemain gelap atau transfer akun ilegal.</li>
                </ul>
              </li>
            </ul>

            <div className="flex gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-3 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Aturan Keamanan (Viewer Mode):</strong>
                Pengguna tanpa tim, tim dengan status pending/reject, atau anggota tim yang terblokir oleh Roster Lock secara otomatis masuk ke dalam **Viewer Mode (Mode Penonton)**. Mereka hanya bisa melihat scoreboard dan solve feed tetapi diblokir total dari deskripsi challenge dan submit flag.
              </div>
            </div>
          </div>
        </section>

        {/* Tahap 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-base font-black uppercase text-gray-900 dark:text-white">
              Langkah 4: Pengumpulan & Evaluasi Write-Up (WU)
            </h3>
          </div>
          <div className="pl-10 space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
            <p>
              Sistem pengerjaan dan pengumpulan write-up dikoordinasikan secara otomatis oleh sistem:
            </p>
            
            <div className="rounded-xl border border-gray-250 bg-gray-50/20 dark:border-gray-800 dark:bg-gray-950/40 p-4 space-y-4">
              {/* Trigger */}
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs">A. Aktivasi Fitur & Pemicu Kemunculan</p>
                  <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                    Modul pengumpulan write-up di halaman kompetisi user {"hanya akan muncul jika Admin mengisi kolom \"Write-Up Deadline\""} saat melakukan pembuatan/pengeditan event. Jika deadline dikosongkan (Null), maka fitur pengumpulan write-up dinonaktifkan (tidak tampil di layar user).
                  </p>
                </div>
              </div>

              {/* User Side */}
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs">B. Cara Unduh & Unggah (Sisi Tim Peserta)</p>
                  <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                    Ketika box pengumpulan muncul di atas daftar tantangan pada halaman <strong>Challenges</strong>:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-gray-500">
                    <li>Semua anggota tim dapat mengeklik tombol biru <strong className="text-blue-400">{"\"Download Template-WU.docx\""}</strong> untuk mengunduh template laporan resmi.</li>
                    <li><strong className="text-gray-950 dark:text-gray-300">Hanya Kapten Tim</strong> yang berhak mengunggah berkas laporan. Tombol drag-and-drop unggah dinonaktifkan bagi anggota biasa.</li>
                    <li>File harus berformat <strong className="text-gray-950 dark:text-gray-300">.pdf</strong> atau <strong className="text-gray-950 dark:text-gray-300">.docx</strong> dengan ukuran berkas maksimal <strong className="text-gray-950 dark:text-gray-300">10 MB</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Admin Side */}
              <div className="flex items-start gap-2.5">
                <Award className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs">C. Evaluasi & Penilaian Bonus/Penalti (Sisi Admin)</p>
                  <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                    Setelah berkas diunggah oleh peserta, Admin melakukan penilaian dengan langkah berikut:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-gray-500">
                    <li>Buka menu <strong className="text-gray-900 dark:text-white">Write-Ups</strong> pada bagian atas dashboard admin, pilih event dari dropdown select.</li>
                    <li>Unduh berkas pengerjaan tim dengan mengeklik tautan nama berkas di tabel daftar masuk.</li>
                    <li>Klik tombol <strong className="text-blue-500">Evaluate</strong> pada baris tim terkait.</li>
                    <li>Masukkan <strong className="text-gray-950 dark:text-gray-300">Score Adjustment</strong> (masukkan angka positif seperti <code className="bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded font-mono text-[10px]">+50</code> untuk bonus nilai, atau negatif seperti <code className="bg-red-500/10 text-red-500 px-1 py-0.5 rounded font-mono text-[10px]">-20</code> untuk pinalti).</li>
                    <li>Tulis feedback/catatan penilai (opsional), lalu klik <strong className="text-gray-900 dark:text-white">Submit Evaluation</strong>. Scoreboard tim bersangkutan akan ter-update otomatis secara real-time.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </AdminDataSurface>
  )
}
