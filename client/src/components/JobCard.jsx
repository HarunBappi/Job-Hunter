/* eslint-disable react/prop-types */

import { format } from "date-fns";
import { Link } from "react-router-dom";
const JobCard = ({ job }) => {
  const { _id, title, date, category, minPrice, maxPrice, description, bid_count} = job || {};
  return (
    <Link
      to={`/job/${_id}`}
      className="w-full max-w-sm px-4 py-3 bg-white rounded-md shadow-md hover:scale-[1.05] transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-light text-gray-800 ">
          Deadline: {format(new Date(date), "P")}
        </span>
        <span className={`px-3 py-1 text-[8px] uppercase  ${job.category === 'Web Development' && 'text-blue-500 bg-blue-100/60'} ${job.category === 'Graphics Design' && 'text-green-500 bg-green-100/60'} ${job.category === 'Digital Marketing' && 'text-red-500 bg-red-100/60'} rounded-full `}>
          {category}
        </span>
      </div>

      <div>
        <h1 className="mt-2 text-lg font-semibold text-gray-800 ">{title}</h1>

        <p className="mt-2 text-sm text-gray-600 ">
          {description.substring(0, 70)}...
        </p>
        <p className="mt-2 text-sm font-bold text-gray-600 ">
          Range: ${minPrice} - ${maxPrice}
        </p>
        <p className="mt-2 text-sm font-bold text-gray-600 ">Total Bids:{bid_count}</p>
      </div>
    </Link>
  );
};

export default JobCard;
