import logo from 'assets/images/outerbridge_brand.png'
import logoDark from 'assets/images/outerbridge_brand_white.png'

import { useSelector } from 'react-redux'

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
            <img
style={{ objectFit: 'scale-down', height: 'auto', width: 100, paddingLeft: '20px' }}
src={customization.isDarkMode ? logoDark : logo}
                alt='Weave'
            />
        </div>
    )
}

export default Logo
