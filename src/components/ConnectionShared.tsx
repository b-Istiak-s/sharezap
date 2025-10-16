export function ConnectionShared() {
  const SharedData = [
    {
      type: "text",
      text: "lorem ipsumlorem ipsumlorem ipsumlorem ipsum",
    },
    {
      type: "text",
      text: "https://google.com",
    },
    {
      type: "file",
      fileName: "file.txt",
      fileSize: "100 MB",
    },
  ];
  return (
    <div className="flex flex-col gap-2 m-2 flex-1">
      <span className="font-bold">Shared</span>
      {SharedData.map((item, index) => (
        <div
          key={index}
          className="bg-[#D9D9D9] p-2 flex justify-between items-center w-80 rounded-lg"
        >
          {item.type === "text" ? (
            <>
              <span className="truncate mr-2">{item.text}</span>
              <button className="rounded-2xl bg-[#6A70D9] text-white px-3 py-1">
                Copy
              </button>
            </>
          ) : (
            <div className="flex justify-between items-center w-full">
              <div className="truncate mr-2">
                <span>{item.fileName}</span> • <span>{item.fileSize}</span>
              </div>
              <button className="rounded-2xl bg-[#484848] text-white px-3 py-1">
                Download
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
