import os
import zipfile

def create_submission_zip():
    zip_name = "Task-2_TC-INT-18991230-761.zip"
    source_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Creating submission zip archive: {zip_name}")
    
    # Files/folders to exclude
    exclude_folders = {'.git', 'node_modules', '__pycache__', '.gemini', 'antigravity-ide'}
    
    zip_count = 0
    with zipfile.ZipFile(os.path.join(source_dir, zip_name), 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude folders by modifying dirs in place
            dirs[:] = [d for d in dirs if d not in exclude_folders]
            
            for file in files:
                # Do not include the output zip itself
                if file == zip_name or file == 'make_zip.py':
                    continue
                    
                file_path = os.path.join(root, file)
                # Compute path relative to the root directory
                arcname = os.path.relpath(file_path, source_dir)
                
                # Wrap inside a base "Task-2" folder to keep directory clean
                archive_path = os.path.join("Task-2", arcname)
                
                zipf.write(file_path, archive_path)
                zip_count += 1
                
    print(f"Successfully packaged {zip_count} files into {zip_name}!")
    size_mb = os.path.getsize(os.path.join(source_dir, zip_name)) / (1024 * 1024)
    print(f"ZIP File Size: {size_mb:.2f} MB")

if __name__ == "__main__":
    create_submission_zip()
