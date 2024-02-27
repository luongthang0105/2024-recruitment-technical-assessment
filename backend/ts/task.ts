
type FileData = {
    id: number,
    name: string,
    categories: string[],
    parent: number,
    size: number
};

/**
 * Task 1
 */
// Idea: Iterate through every file, if a file has a parent, mark the parent's id as true.
// This means that any file that didn't get marked is the leaf file, because only parent files get marked.
// Time complexity: O(n), for n is the number of files, because we only need to iterate all the files twice.
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

        if (!isParent.hasOwnProperty(fileId)) {
            leafFileNames.push(fileName);
        }
    }

    return leafFileNames;
}

/**
 * Task 2
 */
// Idea: Keep an object (categoriesCount) to keep track of the frequency of each category.
// Put these key-value element into an array and sort them.
// Then take out the first K elements.
// Time complexity: O(n log n * m), where n is the number of files, m is the average size of file names.
// The bottleneck for this function is the sort function, which takes O(n log n * m).
// There's a factor m at the end because we might need to do the localecompare, which I guess it would take O(m) in average. 
function kLargestCategories(files: FileData[], k: number): string[] {
    // Create an object to record the number of files in each category
    let categoriesCount: Record<string, number> = {};
    
    for (const file of files) {
        const fileCategories = file.categories;
        for (const category of fileCategories) {
            if (!categoriesCount.hasOwnProperty(category)) {
                categoriesCount[category] = 0;
            } 
            categoriesCount[category] += 1;
        }
    }

    
    // Since we can't sort object, we can instead append the key-value into an array so we can sort them.
    // An element of this new array is an array that has the form [categoryName, count].
    let categoriesCountArray = []
    for (const keyValueArray of Object.entries(categoriesCount)) {
        categoriesCountArray.push(keyValueArray);
    }

    // Sort the array in descending order by their count, then in alphabetical order by their category name.
    categoriesCountArray.sort((a, b) => {
        if (a[1] != b[1]) {
            return b[1] - a[1];
        } else {
            return a[0].localeCompare(b[0]);
        }
    })
    
    // To get the top K categories, we filter out the categories whose index is less than K.
    // This would meet the requirements where there are less than K categories in the list.
    const kLargestCategoriesArray = categoriesCountArray.filter((categCountPair, index) => index < k).map(categCountPair => categCountPair[0]);

    // console.log(categoriesCountArray);
    return kLargestCategoriesArray;
}

/**
 * Task 3
 */
// The overall flow would be create an object (rootFileSizes) to record the file sizes, including their children and grandchildren.
// To fill rootFileSizes up, we can simply iterate through every file, find their very top father (the root), and add their file sizes to the 
// record of the root file. This is because we know that the biggest file will always be the root file, hence we only need to add sizes to the root.
// After processing every file, we simply find the largest file size within rootFileSizes.

// Worst case Time complexity: O(n^3), for n is the number of files.
// This is because when iterating through each file, we need to find the root parent, which
// takes at most O(n). And for each time we need to find a parent, we use the function 
// .find() for it, which takes O(n) as well.
// Since these operations are nested inside each other, the worst-case time complexity 
// would be O(n^3).
function largestFileSize_Simple(files: FileData[]): number {
    // Create an object to record the file sizes.
    let rootFileSizes: Record<string, number> = {};

    for (const file of files) {
        const fileSize = file.size;
        let rootFile = file;

        // Traverse backwards by using the parent id until get to root.
        while (rootFile.parent != -1) {
            // Find the parent file within files[] by id.
            const parentFile = files.find((file) => file.id === rootFile.parent);

            // Safely deal with undefined check 
            // (linting won't let me directly assign the results to rootFile because .find() might return undefined, 
            // even tho we assume that the parent file always exist if it's ID is not -1)
            if (parentFile) {
                rootFile = parentFile;
            } else {
                // If we can't find a file with the current id then probably files() is not correct.
                return -1;
            }
        }
        
        const rootFileName = rootFile.name;
        // If root file hasn't been added to rootFileSizes, initalize it with value 0.
        if (!rootFileSizes.hasOwnProperty(rootFileName)) {
            rootFileSizes[rootFileName] = 0;
        }
        // Add file size of the file itself (in case itself is a root), its child or its grandchild to the root file.
        rootFileSizes[rootFileName] += fileSize;
    }

    // Extract the maximum file size from rootFileSizes.
    let maxFileSize = -1;
    for (const fileSize of Object.values(rootFileSizes)) {
        maxFileSize = Math.max(maxFileSize, fileSize);
    }

    return maxFileSize;
}

// I also made another solution for task 3. This solution utilizes Union Find data structure 
// to compress the paths that each file needs to travel up.
// We initialize rootFileMap to save the root file of a file.
// By caching this information, we get rid of the need to traverse up the same path 
// multiple times whenever a child file needs to look for their root.

// Worst case time complexity: O(n^2 * logn).
// The part that we try to find the root file was the one that got optimized by U-F data structures.
// By using path compression technique, we effectively reduced the time complexity of finding 
// root file down to O(logn).
// However, it also takes O(n) to find the parent file, so the worst case time complexity
// would be O(n^2 * logn).
// The time complexity can be further optimized to O(nlogn) if files[] is an object instead of an array. That way, we can access file faster rather than iteratively find it.
const errorFilePrompt = "Invalid Files";
function findRootFile(currFile: FileData, files: FileData[], rootFileMap: Record<string, string>): string {
    // Base case, the same as the simple one, we terminate when we get to the root.
    if (currFile.parent === -1) {
        return currFile.name;
    }

    // If we already cached this file's root, return the root from the map.
    if (rootFileMap.hasOwnProperty(currFile.name)) {
        return rootFileMap[currFile.name];
    }

    const parentFile = files.find((file) => file.id === currFile.parent); 
    if (!parentFile) {
        return errorFilePrompt;
    }
    // Recursively call this function to get up to the parent file.
    const rootFile = findRootFile(parentFile, files, rootFileMap);

    // Most important part: cache the root to this current file
    rootFileMap[currFile.name] = rootFile;

    return rootFile;
}
function largestFileSize_Optimized(files: FileData[]): number {
    // Create an object to record the file sizes.
    let rootFileSizes: Record<string, number> = {};
    // Create an object to store the root file of each file.
    let rootFileMap: Record<string, string> = {};

    for (const file of files) {
        const fileSize = file.size;
        
        let rootFileName;
        // If already cache the root file for this file, pull it out from the map.
        if (rootFileMap.hasOwnProperty(file.name)) {
            // console.log(`Already cache root file for ${file.name}`);
            rootFileName = rootFileMap[file.name];
        } else {
            rootFileName = findRootFile(file, files, rootFileMap);
        }
        
        // If returned rootFile is an emptyFileData, this means files[] has some errors, 
        // we need to terminate this function. Otherwise it will loop forever.
        if (rootFileName === errorFilePrompt) {
            return -1;
        }

        // If root file hasn't been added to rootFileSizes, initalize it with value 0.
        if (!rootFileSizes.hasOwnProperty(rootFileName)) {
            rootFileSizes[rootFileName] = 0;
        }
        // Add file size of the file itself (in case itself is a root), its child or its grandchild to the root file.
        rootFileSizes[rootFileName] += fileSize;
    }

    // Extract the maximum file size from rootFileSizes.
    let maxFileSize = -1;
    for (const fileSize of Object.values(rootFileSizes)) {
        maxFileSize = Math.max(maxFileSize, fileSize);
    }

    return maxFileSize;
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
    { id: 21, name: "Video.mp4", categories: ["Media", "Videos"], parent: 34, size: 6144 },
    { id: 3, name: "Folder", categories: ["Folder"], parent: -1, size: 0 },
    { id: 5, name: "Spreadsheet.xlsx", categories: ["Documents", "Excel"], parent: 3, size: 4096 },
    { id: 8, name: "Backup.zip", categories: ["Backup"], parent: 233, size: 8192 },
    { id: 13, name: "Presentation.pptx", categories: ["Documents", "Presentation"], parent: 3, size: 3072 },
    { id: 34, name: "Folder2", categories: ["Folder"], parent: 3, size: 0 },
    { id: 55, name: "Code.py", categories: ["Programming"], parent: -1, size: 1536 },
    { id: 89, name: "Audio.mp3", categories: ["Media", "Audio"], parent: 34, size: 2560 },
    { id: 144, name: "Spreadsheet2.xlsx", categories: ["Documents", "Excel"], parent: 3, size: 2048 },
    { id: 233, name: "Folder3", categories: ["Folder"], parent: -1, size: 4096 },
];

const testFile_1: FileData[] = [
    { id: 1, name: "Document", categories: ["Documents"], parent: -1, size: 1024 },
    { id: 2, name: "Image", categories: ["Media", "Photos"], parent: -1, size: 2048 },
    { id: 3, name: "Folder", categories: ["Folder"], parent: -1, size: 0 },
]

const testFile_ZeroSizes: FileData[] = [
    { id: 1, name: "Document", categories: ["Documents"], parent: -1, size: 0 },
    { id: 2, name: "Image", categories: ["Media", "Photos"], parent: -1, size: 0 },
    { id: 3, name: "Folder", categories: ["Folder"], parent: -1, size: 0 },
]

const testFile_2: FileData[] = [
    { id: 1, name: "Document", categories: ["Documents"], parent: -1, size: 10 },
    { id: 2, name: "Image", categories: ["Media", "Photos"], parent: -1, size: 5 },
    { id: 3, name: "Folder", categories: ["Folder"], parent: -1, size: 0 },
    { id: 4, name: "Ahihi", categories: ["Documents"], parent: 2, size: 6 },
]

const testFile_3: FileData[] = [
    { id: 1, name: "Document", categories: ["Folder"], parent: -1, size: 10 },
    { id: 2, name: "Image", categories: ["Media", "Photos"], parent: -1, size: 5 },
    { id: 3, name: "Folder", categories: ["Document"], parent: -1, size: 12 },
    { id: 4, name: "Doc", categories: ["Folder"], parent: 2, size: 6 },
    { id: 5, name: "Doc2", categories: ["Folder"], parent: 4, size: 6 },
    { id: 6, name: "Doc3", categories: ["Folder"], parent: 5, size: 6 },
    // Largest file: Doc3->Doc2->Doc->Image = 6 * 3 + 5 = 23
]


function testTask1() {
    console.log("Start testing Task 1 ");
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
    console.assert(arraysEqual(
        leafFiles(testFile_1).sort((a, b) => a.localeCompare(b)),
        [
            "Document",
            "Image",
            "Folder"
        ].sort((a, b) => a.localeCompare(b))
    ));

    console.assert(arraysEqual(
        leafFiles(testFile_2).sort((a, b) => a.localeCompare(b)),
        [
            "Document",
            "Ahihi",
            "Folder"
        ].sort((a, b) => a.localeCompare(b))
    ));

    console.assert(arraysEqual(
        leafFiles(testFile_3).sort((a, b) => a.localeCompare(b)),
        [
            "Document",
            "Doc3",
            "Folder"
        ].sort((a, b) => a.localeCompare(b))
    ));
    console.log("Passed testing Task 1! \n");
}

function testTask2() {
    console.log("Start testing Task 2 ");

    // Testing on TestFiles
    console.assert(arraysEqual(
        kLargestCategories(testFiles, 3),
        ["Documents", "Folder", "Media"]
    ));
    
    console.assert(arraysEqual(
        kLargestCategories(testFiles, 10),
        ["Documents", "Folder", "Media", "Excel", "Audio", "Backup", "Photos", "Presentation", "Programming", "Videos"]
    ));
    
    console.assert(arraysEqual(
        kLargestCategories(testFiles, 11),
        ["Documents", "Folder", "Media", "Excel", "Audio", "Backup", "Photos", "Presentation", "Programming", "Videos"]
    ));
    
    // Testing on TestFile_1
    console.assert(arraysEqual(
        kLargestCategories(testFile_1, 5),
        ["Documents", "Folder", "Media", "Photos"]
    ));

    console.assert(arraysEqual(
        kLargestCategories(testFile_1, 2),
        ["Documents", "Folder"]
    ));

    console.assert(arraysEqual(
        kLargestCategories(testFile_3, 5),
        ["Folder", "Document", "Media", "Photos"]
    ));
    console.log("Passed testing Task 2! \n ");

}

function testTask3_Simple() {
    console.log("Start testing Task 3, The Simple Way ");
    console.assert(largestFileSize_Simple(testFiles) === 20992);
    console.assert(largestFileSize_Simple(testFile_1) === 2048);
    console.assert(largestFileSize_Simple(testFile_ZeroSizes) === 0);
    console.assert(largestFileSize_Simple(testFile_2) === 11);
    console.assert(largestFileSize_Simple(testFile_3) === 23);
    console.log("Passed testing Task 3, The Simple Way! \n ");
}

function testTask3_Better() {
    console.log("Start testing Task 3, The Hard Way ");
    console.assert(largestFileSize_Optimized(testFiles) === 20992);
    console.assert(largestFileSize_Optimized(testFile_1) === 2048);
    console.assert(largestFileSize_Optimized(testFile_ZeroSizes) === 0);
    console.assert(largestFileSize_Optimized(testFile_2) === 11);
    console.assert(largestFileSize_Optimized(testFile_3) === 23);
    console.log("Passed testing Task 3, The Hard Way! \n ");
}

testTask1();
testTask2();
testTask3_Simple();
testTask3_Better();