import React, { useState } from "react";
import WorkplaceForm from "../components/Workplace/WorkplaceForm";
import WorkplaceList from "../components/Workplace/WorkplaceList";

const WorkplacesPage = () => {
  const [refresh, setRefresh] = useState(false);
  const [selectedWorkplace, setSelectedWorkplace] = useState(null); 

  const handleRefresh = () => setRefresh(!refresh);

  return (
    <div className="p-6 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <WorkplaceForm
            onRefresh={handleRefresh}
            selectedWorkplace={selectedWorkplace}
            setSelectedWorkplace={setSelectedWorkplace}
          />
        </div>
        <div>
          <WorkplaceList
            refresh={refresh}
            onRefresh={handleRefresh}
            setSelectedWorkplace={setSelectedWorkplace}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkplacesPage;


