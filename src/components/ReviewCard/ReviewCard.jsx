import "./ReviewCard.css";
import { reviewData } from "./reviewData";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

function ReviewCard(){

return(

<section id="about" className="review-section">

<div className="review-heading">

<h5>Testimonials</h5>

<h2>What Our Customers Say</h2>

<p>

More than 1000+ happy customers trust Madhuram Cafe.

</p>

</div>

<div className="review-grid">

{

reviewData.map((item)=>(

<div className="review-card" key={item.id}>

<div className="quote">

<FaQuoteLeft/>

</div>

<p className="review-text">

{item.review}

</p>

<div className="rating">

{

[...Array(item.rating)].map((_,index)=>(

<FaStar key={index}/>

))

}

</div>

<div className="customer">

<img src={item.image} alt={item.name}/>

<div>

<h3>{item.name}</h3>

<span>{item.city}</span>

</div>

</div>

</div>

))

}

</div>

</section>

)

}

export default ReviewCard;