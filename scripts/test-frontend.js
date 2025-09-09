// Test script to simulate frontend request
const testData = {
  id: Date.now(),
  nomor: "[Pilih kategori untuk generate nomor]",
  tanggal: "2025-01-21",
  tujuan: "Test Tujuan",
  perihal: "Test Perihal",
  pembuat: "Test User",
  pembuatId: 1,
  kategori: "",
  fullKategori: ".."
};

console.log("Sending test data:", testData);

fetch('http://localhost:3000/api/surat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));