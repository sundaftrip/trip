/* Halaman daftar Paket Tour digabung ke beranda — semua tour kini tampil
   di beranda. URL /tours diarahkan ke bagian tour di beranda agar semua
   tautan lama (menu, tombol) tetap berfungsi. */
import { redirect } from "next/navigation";

export default function ToursPage() {
  redirect("/#tours");
}
