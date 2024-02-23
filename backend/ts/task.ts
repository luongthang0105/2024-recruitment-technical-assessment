
type FileData = {
    id: number,
    name: string,
    categories: string[],
    parent: number
    size: number
};

/**
 * Task 1
 */
function leafFiles(files: FileData[]): string[] {
    // Our result array contains names of leaf files
    let leafFileNames: string[] = [];

    // An object that record any file that is a parent of another file.
    // If a file is a parent of another file, then the parent file id is going to be paired with the boolean value 
    // "true" in the isParent object 
    let isParent: Record<number, boolean> = {};

    for (const file of files) {
        const parentId = file.parent;
        isParent[parentId] = true;
    }

    // If there exists a file whose id does not exist as a key in isParent, then we know it's the leaf file.
    // Hence, we can add the file's name to the result array leafFileNames.
    for (const file of files) {
        const fileId = file.id;
        const fileName = file.name;

        if (!Object.hasOwn(isParent, fileId)) {
            leafFileNames.push(fileName);
        }
    }

    return leafFileNames;
}

/**
 * Task 2
 */
function kLargestCategories(files: FileData[], k: number): string[] {
    return [];
}

/**
 * Task 3
 */
function largestFileSize(files: FileData[]): number {
    return 1;
}


function arraysEqual<T>(a: T[], b: T[]): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const testFiles: FileData[] = [
    { id: 1, name: "Document.txt", categories: ["Documents"], parent: 3, size: 1024 },
    { id: 2, name: "Image.jpg", categories: ["Media", "Photos"], parent: 34, size: 2048 },
    { id: 3, name: "Folder", categories: ["Folder"], parent: -1, size: 0 },
    { id: 5, name: "Spreadsheet.xlsx", categories: ["Documents", "Excel"], parent: 3, size: 4096 },
    { id: 8, name: "Backup.zip", categories: ["Backup"], parent: 233, size: 8192 },
    { id: 13, name: "Presentation.pptx", categories: ["Documents", "Presentation"], parent: 3, size: 3072 },
    { id: 21, name: "Video.mp4", categories: ["Media", "Videos"], parent: 34, size: 6144 },
    { id: 34, name: "Folder2", categories: ["Folder"], parent: 3, size: 0 },
    { id: 55, name: "Code.py", categories: ["Programming"], parent: -1, size: 1536 },
    { id: 89, name: "Audio.mp3", categories: ["Media", "Audio"], parent: 34, size: 2560 },
    { id: 144, name: "Spreadsheet2.xlsx", categories: ["Documents", "Excel"], parent: 3, size: 2048 },
    { id: 233, name: "Folder3", categories: ["Folder"], parent: -1, size: 4096 },
];

console.log(1);
console.assert(arraysEqual(
    leafFiles(testFiles).sort((a, b) => a.localeCompare(b)),
    [
        "Audio.mp3",
        "Backup.zip",
        "Code.py",
        "Document.txt",
        "Image.jpg",
        "Presentation.pptx",
        "Spreadsheet.xlsx",
        "Spreadsheet2.xlsx",
        "Video.mp4"
    ]
));

// console.assert(arraysEqual(
//     kLargestCategories(testFiles, 3),
//     ["Documents", "Folder", "Media"]
// ));

// console.assert(largestFileSize(testFiles) == 20992)
