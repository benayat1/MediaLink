export async function fetchFile(fileType: string, fileName: string) {
  try {
      const response = await fetch(`http://localhost:8000/get_file/${fileType}/${fileName}`);
      if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const data = await response.json(); // נניח שה-backend מחזיר JSON
      if (data.file) {
          return `data:${fileType};base64,${data.file}`; // יוצר URL להצגת הקובץ
      }
      throw new Error("Invalid file data");
  } catch (error) {
      console.error(error);
      return null;
  }
}
