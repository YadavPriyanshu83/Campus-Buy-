import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { showAllButtons } from '../utils/headerSlice'
import HeroSection from '../Component/HeroSection.jsx'
import Review from '../Component/Review.jsx'
import Cards from '../Component/Cards.jsx'
import Header from '../Component/Header.jsx';
function Dummy() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(showAllButtons());
  }, [dispatch]);
  return (
    <>
      <Header />
      <div>
        <HeroSection />
        <Review />
        <Cards />
      </div>
    </>
  )
}

export default Dummy